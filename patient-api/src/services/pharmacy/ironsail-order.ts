import Order from '../../models/Order';
import PharmacyProduct from '../../models/PharmacyProduct';
import { google } from 'googleapis';
import PDFDocument from 'pdfkit';
import sgMail from '@sendgrid/mail';
import ShippingOrder, { OrderShippingStatus } from '../../models/ShippingOrder';

interface IronSailOrderData {
    orderNumber: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientAddress: string;
    productName: string;
    productSKU: string;
    dosage: string;
    quantity: number;
    shippingAddress: string;
    doctorNotes?: string;
    orderDate: string;
}

class IronSailOrderService {
    private spreadsheetId: string;

    constructor() {
        this.spreadsheetId = process.env.IRONSAIL_FUSE_PRODUCTS_SPREADSHEET_ID || '14Lwc-mbVaqd_oGvg-0C7oyPa3JmaRQ7cLXcN1kl4LT8';
    }

    async createOrder(order: Order, coverage?: PharmacyProduct) {
        try {
            console.log(`🚢 [IronSail] Processing order ${order.orderNumber}`);

            // Extract order data
            const orderData = this.extractOrderData(order, coverage);

            // 1. Generate PDF
            console.log(`📄 [IronSail] Generating PDF for order ${order.orderNumber}`);
            const pdfBuffer = await this.generatePDF(orderData);

            // 2. Send email with PDF attachment
            console.log(`📧 [IronSail] Sending email for order ${order.orderNumber}`);
            await this.sendEmail(orderData, pdfBuffer);

            // 3. Write to Google Spreadsheet
            console.log(`📊 [IronSail] Writing to spreadsheet for order ${order.orderNumber}`);
            await this.writeToSpreadsheet(orderData);

            // 4. Create ShippingOrder record
            console.log(`📋 [IronSail] Creating ShippingOrder record`);
            await ShippingOrder.create({
                orderId: order.id,
                shippingAddressId: order.shippingAddressId,
                status: OrderShippingStatus.PROCESSING,
                pharmacyOrderId: `IRONSAIL-${order.orderNumber}`
            });

            console.log(`✅ [IronSail] Order ${order.orderNumber} processed successfully`);

            return {
                success: true,
                message: "IronSail order processed successfully",
                data: {
                    orderNumber: order.orderNumber,
                    pharmacyOrderId: `IRONSAIL-${order.orderNumber}`
                }
            };

        } catch (error) {
            console.error(`❌ [IronSail] Failed to process order ${order.orderNumber}:`, error);
            return {
                success: false,
                message: "Failed to process IronSail order",
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private extractOrderData(order: Order, coverage?: PharmacyProduct): IronSailOrderData {
        const patient = order.user;
        const shippingAddr = order.shippingAddress;
        const product = order.tenantProduct?.product || order.orderItems?.[0]?.product;

        return {
            orderNumber: order.orderNumber,
            patientName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim(),
            patientEmail: patient?.email || '',
            patientPhone: patient?.phoneNumber || '',
            patientAddress: patient?.address && patient?.city && patient?.state && patient?.zipCode
                ? `${patient.address}, ${patient.city}, ${patient.state} ${patient.zipCode}`
                : '',
            productName: coverage?.pharmacyProductName || product?.name || 'Unknown Product',
            productSKU: coverage?.pharmacyProductId || product?.pharmacyProductId || '',
            dosage: product?.dosage || '',
            quantity: order.orderItems?.[0]?.quantity || 1,
            shippingAddress: shippingAddr
                ? `${shippingAddr.address || ''} ${shippingAddr.apartment || ''}, ${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.zipCode || ''}`
                : '',
            doctorNotes: order.notes || order.doctorNotes,
            orderDate: new Date(order.createdAt).toLocaleDateString('en-US')
        };
    }

    private async generatePDF(data: IronSailOrderData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('Pharmacy Order - IronSail', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Order #: ${data.orderNumber}`, { align: 'center' });
            doc.text(`Date: ${data.orderDate}`, { align: 'center' });
            doc.moveDown(2);

            // Patient Information
            doc.fontSize(16).text('Patient Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            doc.text(`Name: ${data.patientName}`);
            doc.text(`Email: ${data.patientEmail}`);
            doc.text(`Phone: ${data.patientPhone}`);
            doc.text(`Address: ${data.patientAddress}`);
            doc.moveDown(2);

            // Product Information
            doc.fontSize(16).text('Product Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            doc.text(`Product: ${data.productName}`);
            doc.text(`SKU: ${data.productSKU}`);
            doc.text(`Dosage: ${data.dosage}`);
            doc.text(`Quantity: ${data.quantity}`);
            doc.moveDown(2);

            // Shipping Information
            doc.fontSize(16).text('Shipping Address', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            doc.text(data.shippingAddress);
            doc.moveDown(2);

            // Doctor Notes
            if (data.doctorNotes) {
                doc.fontSize(16).text('Doctor Notes', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12);
                doc.text(data.doctorNotes);
            }

            doc.end();
        });
    }

    private async sendEmail(data: IronSailOrderData, pdfBuffer: Buffer): Promise<void> {
        const recipientEmail = process.env.IRONSAIL_FUSE_PRODUCTS_DESTINATION_EMAIL_ADDRESS || 'orders@ironsail.com';

        const msg: any = {
            to: recipientEmail,
            from: 'noreply@fuse.health',
            subject: `New Order ${data.orderNumber} - ${data.patientName}`,
            html: `
        <h2>New Pharmacy Order from FUSE</h2>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Patient:</strong> ${data.patientName}</p>
        <p><strong>Product:</strong> ${data.productName} (${data.productSKU})</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Shipping:</strong> ${data.shippingAddress}</p>
        <br>
        <p>Please see the attached PDF for complete order details.</p>
      `,
            attachments: [
                {
                    content: pdfBuffer.toString('base64'),
                    filename: `Order_${data.orderNumber}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                },
            ],
        };

        await sgMail.send(msg);
        console.log(`✅ [IronSail] Email sent to ${recipientEmail}`);
    }

    private async writeToSpreadsheet(data: IronSailOrderData): Promise<void> {
        try {
            // Initialize Google Sheets API
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
                    private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            const sheets = google.sheets({ version: 'v4', auth });

            // Use configurable sheet name or default to 'Sheet1'
            const sheetName = process.env.IRONSAIL_SPREADSHEET_SHEET_NAME || 'Sheet1';
            const range = `${sheetName}!A:M`;

            // Check if headers exist (read first row)
            try {
                const headerResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: `${sheetName}!A1:M1`,
                });

                const existingHeaders = headerResponse.data.values?.[0];
                
                // If no headers or empty sheet, add headers
                if (!existingHeaders || existingHeaders.length === 0) {
                    console.log(`📋 [IronSail] Creating headers in spreadsheet`);
                    const headers = [
                        'Timestamp',
                        'Order Number',
                        'Patient Name',
                        'Patient Email',
                        'Patient Phone',
                        'Patient Address',
                        'Product Name',
                        'Product SKU',
                        'Dosage',
                        'Quantity',
                        'Shipping Address',
                        'Doctor Notes',
                        'Status'
                    ];

                    await sheets.spreadsheets.values.update({
                        spreadsheetId: this.spreadsheetId,
                        range: `${sheetName}!A1:M1`,
                        valueInputOption: 'USER_ENTERED',
                        requestBody: {
                            values: [headers],
                        },
                    });

                    console.log(`✅ [IronSail] Headers created successfully`);
                }
            } catch (headerError) {
                console.log(`⚠️ [IronSail] Could not check headers, will attempt to append anyway:`, headerError);
            }

            // Prepare row data
            const row = [
                new Date().toLocaleString(), // Timestamp
                data.orderNumber,
                data.patientName,
                data.patientEmail,
                data.patientPhone,
                data.patientAddress,
                data.productName,
                data.productSKU,
                data.dosage,
                data.quantity.toString(),
                data.shippingAddress,
                data.doctorNotes || '',
                'Pending', // Status
            ];

            console.log(`📝 [IronSail] Appending order data to ${range}`);

            // Append to spreadsheet
            await sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [row],
                },
            });

            console.log(`✅ [IronSail] Written to spreadsheet: ${this.spreadsheetId} (Sheet: ${sheetName})`);
        } catch (error) {
            console.error(`❌ [IronSail] Failed to write to spreadsheet:`, error);
            throw error;
        }
    }
}

export default IronSailOrderService;

