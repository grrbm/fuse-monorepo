import Order from '../../models/Order';
import PharmacyProduct from '../../models/PharmacyProduct';
import { google } from 'googleapis';
import PDFDocument from 'pdfkit';
import sgMail from '@sendgrid/mail';
import ShippingOrder, { OrderShippingStatus } from '../../models/ShippingOrder';

interface IronSailOrderData {
    orderNumber: string;
    patientFirstName: string;
    patientLastName: string;
    patientEmail: string;
    patientPhone: string;
    patientGender: string;
    patientDOB: string;
    patientAddress: string;
    patientCity: string;
    patientState: string;
    patientZipCode: string;
    patientCountry: string;
    productName: string;
    productSKU: string;
    rxId: string;
    medicationForm: string;
    sig: string;
    dispense: string;
    daysSupply: string;
    refills: string;
    shippingInfo: string;
    memo: string;
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
            console.log(`✅ [IronSail] PDF generated successfully (${pdfBuffer.length} bytes)`);

            // 2. Send email with PDF attachment
            console.log(`📧 [IronSail] Sending email for order ${order.orderNumber}`);
            try {
                await this.sendEmail(orderData, pdfBuffer);
                console.log(`✅ [IronSail] Email sent successfully`);
            } catch (emailError) {
                console.error(`❌ [IronSail] Email send failed:`, emailError);
                throw new Error(`Email send failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
            }

            // 3. Write to Google Spreadsheet
            console.log(`📊 [IronSail] Writing to spreadsheet for order ${order.orderNumber}`);
            try {
                await this.writeToSpreadsheet(orderData);
                console.log(`✅ [IronSail] Spreadsheet updated successfully`);
            } catch (spreadsheetError) {
                console.error(`❌ [IronSail] Spreadsheet write failed:`, spreadsheetError);
                throw new Error(`Spreadsheet write failed: ${spreadsheetError instanceof Error ? spreadsheetError.message : 'Unknown error'}`);
            }

            // 4. Create ShippingOrder record
            console.log(`📋 [IronSail] Creating ShippingOrder record`);
            await ShippingOrder.create({
                orderId: order.id,
                shippingAddressId: order.shippingAddressId,
                status: OrderShippingStatus.PROCESSING,
                pharmacyOrderId: `IRONSAIL-${order.orderNumber}`
            });
            console.log(`✅ [IronSail] ShippingOrder record created`);

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

    // Public method to retry email send for an order
    async retrySendEmail(order: Order, coverage?: PharmacyProduct) {
        try {
            console.log(`📧 [IronSail] Retrying email send for order ${order.orderNumber}`);

            const orderData = this.extractOrderData(order, coverage);
            const pdfBuffer = await this.generatePDF(orderData);

            await this.sendEmail(orderData, pdfBuffer);
            console.log(`✅ [IronSail] Email retry successful for ${order.orderNumber}`);

            return {
                success: true,
                message: "Email sent successfully"
            };
        } catch (error) {
            console.error(`❌ [IronSail] Email retry failed for ${order.orderNumber}:`, error);
            return {
                success: false,
                message: "Failed to send email",
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Public method to retry spreadsheet write for an order
    async retryWriteToSpreadsheet(order: Order, coverage?: PharmacyProduct) {
        try {
            console.log(`📊 [IronSail] Retrying spreadsheet write for order ${order.orderNumber}`);

            const orderData = this.extractOrderData(order, coverage);
            await this.writeToSpreadsheet(orderData);

            console.log(`✅ [IronSail] Spreadsheet retry successful for ${order.orderNumber}`);

            return {
                success: true,
                message: "Spreadsheet updated successfully"
            };
        } catch (error) {
            console.error(`❌ [IronSail] Spreadsheet retry failed for ${order.orderNumber}:`, error);
            return {
                success: false,
                message: "Failed to write to spreadsheet",
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private extractOrderData(order: Order, coverage?: PharmacyProduct): IronSailOrderData {
        const patient = order.user;
        const shippingAddr = order.shippingAddress;
        const product = order.tenantProduct?.product || order.orderItems?.[0]?.product;
        const quantity = order.orderItems?.[0]?.quantity || 1;

        console.log('📋 [IronSail] Extracting order data from patient:', {
            firstName: patient?.firstName,
            lastName: patient?.lastName,
            email: patient?.email,
            phoneNumber: patient?.phoneNumber,
            gender: patient?.gender,
            dob: patient?.dob
        });

        // Format gender
        const gender = patient?.gender ?
            patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '';

        // Format DOB
        const dob = patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '';

        // Use SIG from product placeholder first, then pharmacy coverage, then fallback to order notes or default
        const sig = product?.placeholderSig ||
            coverage?.pharmacyCoverage?.customSig ||
            coverage?.sig ||
            order.doctorNotes ||
            order.notes ||
            `Take as directed by your healthcare provider`;

        // Dispense format
        const dispense = `${quantity} ${product?.medicationSize || 'Unit'}`;

        // Use patient address if available, otherwise fall back to shipping address
        const address = patient?.address || shippingAddr?.address || '';
        const apartment = shippingAddr?.apartment ? `, ${shippingAddr.apartment}` : '';
        const fullAddress = apartment ? `${address}${apartment}` : address;
        const city = patient?.city || shippingAddr?.city || '';
        const state = patient?.state || shippingAddr?.state || '';
        const zipCode = patient?.zipCode || shippingAddr?.zipCode || '';

        console.log('📋 [IronSail] Resolved address fields:', {
            address: fullAddress,
            city,
            state,
            zipCode,
            source: patient?.address ? 'patient' : 'shipping'
        });

        return {
            orderNumber: order.orderNumber,
            patientFirstName: patient?.firstName || '',
            patientLastName: patient?.lastName || '',
            patientEmail: patient?.email || '',
            patientPhone: patient?.phoneNumber || '',
            patientGender: gender,
            patientDOB: dob,
            patientAddress: fullAddress,
            patientCity: city,
            patientState: state,
            patientZipCode: zipCode,
            patientCountry: 'USA',
            productName: coverage?.pharmacyCoverage?.customName || coverage?.pharmacyProductName || product?.name || 'Unknown Product',
            productSKU: coverage?.pharmacyProductId || product?.pharmacyProductId || '',
            rxId: coverage?.rxId || '',
            medicationForm: coverage?.form || '',
            sig: sig,
            dispense: dispense,
            daysSupply: '30',
            refills: '2',
            shippingInfo: 'fedex_priority_overnight',
            memo: 'Order approved',
            orderDate: new Date(order.createdAt).toLocaleDateString('en-US')
        };
    }

    private async generatePDF(data: IronSailOrderData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            // Increase page width by 30% (letter width is 612, 30% more = ~795)
            const doc = new PDFDocument({
                margin: 50,
                size: [795, 1008] // width increased by 30%, height standard letter
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Column positions - adjusted for wider page
            const col1 = 50;
            const col2 = 290;
            const col3 = 530;

            // Company Header
            doc.fontSize(18).font('Helvetica-Bold').text('FUSE HEALTH INC', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text('254 Chapman Road, Ste 208 #24703, Newark, DE 19702 USA', { align: 'center' });
            doc.text('+19095321861', { align: 'center' });
            doc.moveDown(1.5);

            // Title
            doc.fontSize(16).text('Electronic Prescription Order', { align: 'center', underline: true });
            doc.moveDown(1.5);

            // === FIRST 3-COLUMN GRID ===
            let startY = doc.y;

            // Left column
            doc.fontSize(10).text('Prescriber: SHUBH DHRUV', col1, startY);
            doc.text('Order', col1, doc.y);
            doc.text('Number: ' + data.orderNumber, col1, doc.y);
            doc.text('Memo: ' + data.memo, col1, doc.y);

            // Middle column
            doc.text('License: PA63768 (California)', col2, startY);
            doc.text('NPI: 1477329381', col2, doc.y);
            doc.text('Shipping Information: ' + data.shippingInfo, col2, doc.y);

            // Right column
            doc.text('Date: ' + data.orderDate, col3, startY);

            doc.moveDown(3);

            // === PATIENT INFORMATION ===
            doc.fontSize(14).text('Patient Information', 0, doc.y, { align: 'center', underline: true });
            doc.moveDown(1);

            // === SECOND 3-COLUMN GRID ===
            startY = doc.y;

            // Left column
            doc.fontSize(10).text('First', col1, startY);
            doc.text('Name: ' + data.patientFirstName, col1, doc.y);
            doc.moveDown(0.5);
            doc.text('Phone', col1, doc.y);
            doc.text('Number: ' + data.patientPhone, col1, doc.y);
            doc.moveDown(0.5);
            doc.text('Address: ' + data.patientAddress, col1, doc.y);
            doc.moveDown(0.5);
            doc.text('State: ' + data.patientState, col1, doc.y);

            // Middle column
            doc.text('Last', col2, startY);
            doc.text('Name: ' + data.patientLastName, col2, doc.y);
            doc.moveDown(0.5);
            doc.text('Email: ' + data.patientEmail, col2, doc.y);
            doc.moveDown(0.5);
            doc.text('City: ' + data.patientCity, col2, doc.y);
            doc.moveDown(0.5);
            doc.text('Zip', col2, doc.y);
            doc.text('Code: ' + data.patientZipCode, col2, doc.y);

            // Right column
            doc.text('Gender: ' + data.patientGender, col3, startY);
            doc.moveDown(0.5);
            doc.text('DOB: ' + data.patientDOB, col3, doc.y);
            doc.moveDown(0.5);
            doc.text('Country: ' + data.patientCountry, col3, doc.y);

            doc.moveDown(3);
            // Add 30 pixels extra spacing
            doc.y += 30;

            // === MEDICATION ===
            doc.fontSize(14).text('Medication', 0, doc.y, { align: 'center', underline: true });
            doc.moveDown(1);

            // === THIRD GRID (Labels left, values span middle + right) ===
            startY = doc.y;
            const labelWidth = 80;

            doc.fontSize(10).text('Name:', col1, startY, { width: labelWidth });
            doc.text('RX ID:', col1, doc.y, { width: labelWidth });
            doc.text('Medication Form:', col1, doc.y, { width: labelWidth });
            doc.text('Sig:', col1, doc.y, { width: labelWidth });
            doc.text('Dispense:', col1, doc.y, { width: labelWidth });
            doc.text('Days Supply:', col1, doc.y, { width: labelWidth });
            doc.text('Refills:', col1, doc.y, { width: labelWidth });

            // Values (spanning middle + right columns) - wider for 30% increase
            const valueCol = col1 + labelWidth + 10;
            doc.text(data.productName + ' (' + data.productSKU + ')', valueCol, startY, { width: 500 });
            doc.text(data.rxId, valueCol, doc.y, { width: 500 });
            doc.text(data.medicationForm, valueCol, doc.y, { width: 500 });
            doc.text(data.sig, valueCol, doc.y, { width: 500 });
            doc.text(data.dispense, valueCol, doc.y, { width: 500 });
            doc.text(data.daysSupply, valueCol, doc.y, { width: 500 });
            doc.text(data.refills, valueCol, doc.y, { width: 500 });

            doc.end();
        });
    }

    private async sendEmail(data: IronSailOrderData, pdfBuffer: Buffer): Promise<void> {
        const recipientEmail = process.env.IRONSAIL_FUSE_PRODUCTS_DESTINATION_EMAIL_ADDRESS || 'orders@ironsail.com';
        const patientFullName = `${data.patientFirstName} ${data.patientLastName}`.trim();

        // Build BCC list, excluding the recipient email to avoid duplicates
        const bccEmails = ['grrbm2@gmail.com', 'daniel@fusehealth.com']
            .filter(email => email.toLowerCase() !== recipientEmail.toLowerCase())
            .map(email => ({ email }));

        const msg: any = {
            to: recipientEmail,
            from: 'noreply@fusehealth.com',
            ...(bccEmails.length > 0 && { bcc: bccEmails }), // Only add BCC if there are emails
            subject: `New Prescription Order ${data.orderNumber} - ${patientFullName}`,
            html: `
        <h2>New Electronic Prescription Order from FUSE HEALTH INC</h2>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Date:</strong> ${data.orderDate}</p>
        <p><strong>Patient:</strong> ${patientFullName}</p>
        <p><strong>Medication:</strong> ${data.productName}</p>
        <p><strong>Dispense:</strong> ${data.dispense}</p>
        <p><strong>Shipping:</strong> ${data.shippingInfo}</p>
        <br>
        <p>Please see the attached PDF for complete prescription details.</p>
      `,
            attachments: [
                {
                    content: pdfBuffer.toString('base64'),
                    filename: `Prescription_${data.orderNumber}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                },
            ],
        };

        try {
            await sgMail.send(msg);
            const bccList = bccEmails.map(b => b.email).join(', ');
            console.log(`✅ [IronSail] Email sent to ${recipientEmail}${bccList ? ` (BCC: ${bccList})` : ''}`);
        } catch (error: any) {
            console.error(`❌ [IronSail] SendGrid error details:`, JSON.stringify(error.response?.body, null, 2));
            throw error;
        }
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

            // Check if headers exist (read first row)
            try {
                const headerResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: `${sheetName}!A1:Z1`,
                });

                const existingHeaders = headerResponse.data.values?.[0];

                // If no headers or empty sheet, add headers
                if (!existingHeaders || existingHeaders.length === 0) {
                    console.log(`📋 [IronSail] Creating headers in spreadsheet`);
                    const headers = [
                        'Date',
                        'Order Number',
                        'Prescriber',
                        'License',
                        'NPI',
                        'Patient First Name',
                        'Patient Last Name',
                        'Patient Gender',
                        'Patient Phone',
                        'Patient Email',
                        'RX_ID',
                        'Patient DOB',
                        'Patient Address',
                        'Patient City',
                        'Patient State',
                        'Patient Zip Code',
                        'Patient Country',
                        'Medication Name',
                        'Product SKU',
                        'Sig',
                        'Dispense',
                        'Days Supply',
                        'Refills',
                        'Shipping Information',
                        'Memo',
                        'Status'
                    ];

                    await sheets.spreadsheets.values.update({
                        spreadsheetId: this.spreadsheetId,
                        range: `${sheetName}!A1:Z1`,
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
                data.orderDate,
                data.orderNumber,
                'SHUBH DHRUV', // Prescriber
                'PA63768 (California)', // License
                '1477329381', // NPI
                data.patientFirstName,
                data.patientLastName,
                data.patientGender,
                data.patientPhone,
                data.patientEmail,
                data.rxId,
                data.patientDOB,
                data.patientAddress,
                data.patientCity,
                data.patientState,
                data.patientZipCode,
                data.patientCountry,
                data.productName,
                data.productSKU,
                data.sig,
                data.dispense,
                data.daysSupply,
                data.refills,
                data.shippingInfo,
                data.memo,
                'Pending' // Status
            ];

            const appendRange = `${sheetName}!A:Z`;
            console.log(`📝 [IronSail] Appending order data to ${appendRange}`);

            // Append to spreadsheet
            await sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: appendRange,
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

