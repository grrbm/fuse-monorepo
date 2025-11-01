import { google, sheets_v4 } from 'googleapis';

export interface IronSailProduct {
    id: string;
    sku: string;
    name: string;
    strength?: string;
    nameWithStrength?: string;
    dispense?: string;
    category?: string;
    price?: number;
    [key: string]: any; // Allow additional fields from the spreadsheet
}

export class IronSailService {
    private sheets: sheets_v4.Sheets;
    private spreadsheetId = process.env.IRONSAIL_PRODUCTS_SPREADSHEET || '1HLv6syjnQm3wtrYxnaS66CLsY0qaoyYTaQDqOYbzfgI';

    constructor() {
        // Initialize Google Sheets API with service account
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
                private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
    }

    /**
     * Fetch products from the IronSail Google Spreadsheet
     * @param sheetName Optional sheet name (defaults to 'Sheet1')
     * @returns List of products from the spreadsheet
     */
    async getProducts(sheetName: string = 'Sheet1'): Promise<IronSailProduct[]> {
        try {
            console.log(`📊 Fetching IronSail products from spreadsheet: ${this.spreadsheetId}`);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A:Z`, // Read all columns from A to Z
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                console.log('⚠️ No data found in IronSail spreadsheet');
                return [];
            }

            // First row contains headers
            const headers = rows[0].map(header =>
                String(header).trim().toLowerCase().replace(/\s+/g, '_')
            );

            console.log(`📋 Spreadsheet headers:`, headers);

            // Parse remaining rows as products
            const products: IronSailProduct[] = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                // Map row data to headers
                const product: any = {};
                headers.forEach((header, index) => {
                    if (row[index] !== undefined && row[index] !== '') {
                        product[header] = row[index];
                    }
                });

                // Skip empty rows
                if (Object.keys(product).length === 0) continue;

                // Get the product name from the first column (regardless of header name)
                const productName = row[0] || 'Unknown Product';

                // Get the SKU from "Product ID" column
                const productId = product.product_id || product.formula_id || product.id || product.sku;

                // Get strength from "Strength" column
                const strength = product.strength || product.dosage || product.dose;

                // Get price from "Price" column
                const priceValue = product.price ? parseFloat(String(product.price).replace(/[^0-9.]/g, '')) : undefined;

                // Get type/category
                const category = product.type || product.category;

                // Get dosage form
                const dosageForm = product['dosage_form_/_volume'] || product.dosage_form || product.form || product.dispense;

                // Normalize to expected format
                const normalizedProduct: IronSailProduct = {
                    id: productId || `ironsail-${i}`,
                    sku: productId || `SKU-${i}`,
                    name: productName,
                    strength: strength,
                    nameWithStrength: strength ? `${productName} (${strength})` : productName,
                    dispense: dosageForm,
                    category: category,
                    price: priceValue,
                    // Keep all original fields for reference
                    _raw: product
                };

                products.push(normalizedProduct);
            }

            console.log(`✅ Successfully fetched ${products.length} products from IronSail`);
            return products;

        } catch (error) {
            console.error('❌ Error fetching IronSail products from spreadsheet:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
                console.error('Stack:', error.stack);
            }
            throw new Error(`Failed to fetch products from IronSail spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get products by state (IronSail doesn't have state-specific products, so returns all)
     * @param state US State code (not used for IronSail)
     * @returns List of all products
     */
    async getProductsByState(state: string): Promise<IronSailProduct[]> {
        // IronSail products are not state-specific, return all products
        return await this.getProducts();
    }

    /**
     * Get all products available across all supported states
     * @param states Array of US State codes (not used for IronSail)
     * @returns List of all products
     */
    async getProductsByStates(states: string[]): Promise<IronSailProduct[]> {
        // IronSail products are not state-specific, return all products once
        return await this.getProducts();
    }
}

