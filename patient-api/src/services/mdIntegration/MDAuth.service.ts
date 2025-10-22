import axios from 'axios';
import { mdIntegrationsConfig, resolveMdIntegrationsBaseUrl } from './config';

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

interface TokenRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
  scope: string;
}

class MDAuthService {
  async generateToken(): Promise<TokenResponse> {
    const requestBody: TokenRequest = {
      grant_type: 'client_credentials',
      client_id: mdIntegrationsConfig.clientId,
      client_secret: mdIntegrationsConfig.clientSecret,
      scope: mdIntegrationsConfig.scope
    };

    const response = await axios.post<TokenResponse>(
      resolveMdIntegrationsBaseUrl('/partner/auth/token'),
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }
}

export default new MDAuthService();