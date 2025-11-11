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
    wholesalePrice?: number;
    suppliesPrice?: number;
    pharmacy?: string;
    serviceProvider?: string;
    states?: string[];
    sig?: string;
    form?: string;
    displayName?: string;
    medicationName?: string;
    rxId?: string;
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

                // Skip empty rows or rows without medication name
                if (Object.keys(product).length === 0) continue;
                
                // New format columns:
                // Display Name, Medication (Pharmacy Name), Form, Pricing, Supplies, Wholesale Price, Pharmacy, Service Provider, States, SIG
                
                // Get display name (first column)
                const displayName = product.display_name || row[0] || 'Unknown Product';
                
                // Get medication name (pharmacy product name)
                const medicationName = product['medication_(pharmacy_name)'] || product.medication || product.medication_name;
                
                // Skip if no medication name
                if (!medicationName) continue;
                
                // Get form
                const form = product.form || 'Injectable';
                
                // Get pricing
                const pricingValue = product.pricing ? parseFloat(String(product.pricing).replace(/[^0-9.]/g, '')) : undefined;
                
                // Get supplies price
                const suppliesValue = product['supplies_(10_syringes_+_wipes)'] || product.supplies;
                const suppliesPrice = suppliesValue ? parseFloat(String(suppliesValue).replace(/[^0-9.]/g, '')) : undefined;
                
                // Get wholesale price
                const wholesalePriceValue = product.wholesale_price;
                const wholesalePrice = wholesalePriceValue ? parseFloat(String(wholesalePriceValue).replace(/[^0-9.]/g, '')) : undefined;
                
                // Get pharmacy
                const pharmacy = product.pharmacy || 'Kaduceus';
                
                // Get service provider
                const serviceProvider = product.service_provider || 'Ironsail';
                
                // Get states (comma-separated, parse into array)
                const statesValue = product.states || '';
                const states = statesValue ? statesValue.split(',').map((s: string) => s.trim()) : [];
                
                // Get SIG
                const sig = product.sig || 'Take as directed by your healthcare provider';
                
                // Get RX_ID
                const rxId = product.rx_id || product.rxid || undefined;

                // Debug logging for first product
                if (i === 1) {
                    console.log('🔍 IronSail spreadsheet raw product data (first row):', product);
                    console.log('🔍 Parsed values:', {
                        displayName,
                        medicationName,
                        form,
                        pricingValue,
                        wholesalePrice,
                        sig,
                        rxId
                    });
                }

                // Normalize to expected format
                const normalizedProduct: IronSailProduct = {
                    id: `ironsail-${medicationName.replace(/[^a-zA-Z0-9]/g, '-')}-${i}`,
                    sku: medicationName,
                    name: medicationName,
                    displayName: displayName,
                    medicationName: medicationName,
                    strength: undefined, // Not in new format as separate field
                    nameWithStrength: medicationName,
                    dispense: form,
                    form: form,
                    category: undefined, // Not in new format
                    price: pricingValue,
                    suppliesPrice: suppliesPrice,
                    wholesalePrice: wholesalePrice,
                    pharmacy: pharmacy,
                    serviceProvider: serviceProvider,
                    states: states,
                    sig: sig,
                    rxId: rxId,
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
     * Get products by state
     * @param state US State code
     * @returns List of products available in that state
     */
    async getProductsByState(state: string): Promise<IronSailProduct[]> {
        const allProducts = await this.getProducts();
        // Filter products that are available in the specified state
        return allProducts.filter(product => 
            product.states && product.states.includes(state)
        );
    }

    /**
     * Get all products available across all supported states
     * @param states Array of US State codes
     * @returns List of products available in any of those states
     */
    async getProductsByStates(states: string[]): Promise<IronSailProduct[]> {
        const allProducts = await this.getProducts();
        // Filter products that are available in at least one of the specified states
        return allProducts.filter(product => 
            product.states && product.states.some(s => states.includes(s))
        );
    }
}

