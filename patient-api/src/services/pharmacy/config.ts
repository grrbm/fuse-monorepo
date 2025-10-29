
export interface PharmacyApiConfig {
    baseUrl: string;
    apiKey: string;
    physicianId: string; // AbsoluteRX physician ID to use for all orders
    physician: {
        npi: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
}

export interface PharmacyApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    validationErrors?: any;
}


export const config: PharmacyApiConfig = {
    baseUrl: 'https://portal.absoluterx.com',
    apiKey: process.env.PHARMACY_API_KEY || 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
    physicianId: process.env.PHARMACY_PHYSICIAN_ID || '4141',
    physician: {
        npi: process.env.PHYSICIAN_NPI || '0000000000',
        firstName: process.env.PHYSICIAN_FIRST_NAME || 'SHUBH',
        lastName: process.env.PHYSICIAN_LAST_NAME || 'DHRUV',
        email: process.env.PHYSICIAN_EMAIL || 'shubhdhruv.nhsc@gmail.com',
        phoneNumber: process.env.PHYSICIAN_PHONE || '19513292195',
    }
}