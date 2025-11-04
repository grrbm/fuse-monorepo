import axios from 'axios';

export interface AbsoluteRXProduct {
    id: number;
    sku: number;
    name: string;
    strength: string;
    name_with_strength: string;
    compound: number;
    controlled: number;
    dispense: string;
    label: string;
}

export interface AbsoluteRXProductsResponse {
    data: AbsoluteRXProduct[];
}

export class AbsoluteRXService {
    private baseUrl = 'https://portal.absoluterx.com/api';
    private apiKey = process.env.ABSOLUTERX_API_KEY || '4a8d2c88-2f7c-4ad2-913b-f0ca1fe563d4';
    private physicianId = process.env.ABSOLUTERX_PHYSICIAN_ID || '4141';

    /**
     * Fetch products available in a specific state
     * @param state US State code (e.g., 'CA', 'NY')
     * @returns List of products available in that state
     */
    async getProductsByState(state: string): Promise<AbsoluteRXProduct[]> {
        try {
            const response = await axios.get<AbsoluteRXProductsResponse>(
                `${this.baseUrl}/clinics/products`,
                {
                    params: {
                        api_key: this.apiKey,
                        state: state,
                        physician_id: this.physicianId,
                    },
                }
            );

            return response.data.data || [];
        } catch (error) {
            console.error(`❌ Error fetching AbsoluteRX products for state ${state}:`, error);
            throw new Error(`Failed to fetch products from AbsoluteRX: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all products available across all supported states
     * @param states Array of US State codes
     * @returns Deduplicated list of products
     */
    async getProductsByStates(states: string[]): Promise<AbsoluteRXProduct[]> {
        try {
            // Fetch products for all states in parallel
            const productsArrays = await Promise.all(
                states.map(state => this.getProductsByState(state))
            );

            // Flatten and deduplicate by SKU
            const allProducts = productsArrays.flat();
            const uniqueProducts = allProducts.reduce((acc, product) => {
                if (!acc.find(p => p.sku === product.sku)) {
                    acc.push(product);
                }
                return acc;
            }, [] as AbsoluteRXProduct[]);

            return uniqueProducts;
        } catch (error) {
            console.error('❌ Error fetching AbsoluteRX products for multiple states:', error);
            throw error;
        }
    }
}

