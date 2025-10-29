
export interface PharmacyApiConfig {
    baseUrl: string;
    apiKey: string;
    testPhysician: {
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
    testPhysician: {
        npi: process.env.TEST_PHYSICIAN_NPI || '0000000000',
        firstName: process.env.TEST_PHYSICIAN_FIRST_NAME || 'Test',
        lastName: process.env.TEST_PHYSICIAN_LAST_NAME || 'Doctor',
        email: process.env.TEST_PHYSICIAN_EMAIL || 'test.doctor@example.com',
        phoneNumber: process.env.TEST_PHYSICIAN_PHONE || '5555555555',
    }
}