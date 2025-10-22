interface MdIntegrationsConfig {
    baseUrl: string;
    environment: 'production' | 'sandbox';
    clientId: string;
    clientSecret: string;
    scope: string;
    defaultOfferingId?: string;
}

const env = (process.env.MD_INTEGRATIONS_ENV || 'production').toLowerCase();

const environment: 'production' | 'sandbox' = env === 'sandbox' ? 'sandbox' : 'production';

const baseUrl = process.env.MD_INTEGRATIONS_BASE_URL
    || (environment === 'sandbox'
        ? 'https://api-sandbox.mdintegrations.com/v1'
        : 'https://api.mdintegrations.com/v1');

const clientId = environment === 'sandbox'
    ? (process.env.MD_INTEGRATIONS_SANDBOX_CLIENT_ID || process.env.MD_INTEGRATIONS_CLIENT_ID || '')
    : (process.env.MD_INTEGRATIONS_CLIENT_ID || '');

const clientSecret = environment === 'sandbox'
    ? (process.env.MD_INTEGRATIONS_SANDBOX_CLIENT_SECRET || process.env.MD_INTEGRATIONS_CLIENT_SECRET || '')
    : (process.env.MD_INTEGRATIONS_CLIENT_SECRET || '');

const defaultOfferingId = environment === 'sandbox'
    ? process.env.MD_INTEGRATIONS_SANDBOX_OFFERING_ID || process.env.MD_INTEGRATIONS_OFFERING_ID
    : process.env.MD_INTEGRATIONS_OFFERING_ID;

export const mdIntegrationsConfig: MdIntegrationsConfig = {
    baseUrl,
    environment,
    clientId,
    clientSecret,
    scope: process.env.MD_INTEGRATIONS_SCOPE || '*',
    defaultOfferingId: defaultOfferingId || undefined,
};

export const isSandbox = environment === 'sandbox';

export function resolveMdIntegrationsBaseUrl(path: string): string {
    return `${mdIntegrationsConfig.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}


