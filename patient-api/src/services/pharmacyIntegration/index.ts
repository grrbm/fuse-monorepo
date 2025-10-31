import { AbsoluteRXService, AbsoluteRXProduct } from './absoluterx.service';

export interface PharmacyProduct {
    id: string | number;
    sku: string | number;
    name: string;
    strength?: string;
    nameWithStrength?: string;
    dispense?: string;
    label?: string;
    [key: string]: any; // Allow additional fields from different pharmacies
}

export class PharmacyIntegrationService {
    private absoluteRXService: AbsoluteRXService;

    constructor() {
        this.absoluteRXService = new AbsoluteRXService();
    }

    /**
     * Get products from a pharmacy by slug
     * @param pharmacySlug Pharmacy slug (e.g., 'absoluterx')
     * @param state Optional state filter (required for some pharmacies)
     * @returns List of products from the pharmacy
     */
    async getProductsByPharmacy(pharmacySlug: string, state?: string): Promise<PharmacyProduct[]> {
        switch (pharmacySlug.toLowerCase()) {
            case 'absoluterx':
                return await this.getAbsoluteRXProducts(state);

            // Add more pharmacy integrations here
            // case 'anotherpharma':
            //   return await this.getAnotherPharmaProducts(state);

            default:
                throw new Error(`Pharmacy integration not implemented for: ${pharmacySlug}`);
        }
    }

    /**
     * Get products from multiple states for a pharmacy
     * @param pharmacySlug Pharmacy slug
     * @param states Array of US State codes
     * @returns Deduplicated list of products
     */
    async getProductsByPharmacyAndStates(pharmacySlug: string, states: string[]): Promise<PharmacyProduct[]> {
        switch (pharmacySlug.toLowerCase()) {
            case 'absoluterx':
                const products = await this.absoluteRXService.getProductsByStates(states);
                return this.normalizeAbsoluteRXProducts(products);

            // Add more pharmacy integrations here

            default:
                throw new Error(`Pharmacy integration not implemented for: ${pharmacySlug}`);
        }
    }

    /**
     * Fetch products from AbsoluteRX
     */
    private async getAbsoluteRXProducts(state?: string): Promise<PharmacyProduct[]> {
        if (!state) {
            throw new Error('State is required for AbsoluteRX products');
        }

        const products = await this.absoluteRXService.getProductsByState(state);
        return this.normalizeAbsoluteRXProducts(products);
    }

    /**
     * Normalize AbsoluteRX products to common format
     */
    private normalizeAbsoluteRXProducts(products: AbsoluteRXProduct[]): PharmacyProduct[] {
        return products.map(product => ({
            id: product.id,
            sku: product.sku,
            name: product.name,
            strength: product.strength,
            nameWithStrength: product.name_with_strength,
            dispense: product.dispense,
            label: product.label,
            // Keep original data for reference
            _raw: product,
        }));
    }
}

