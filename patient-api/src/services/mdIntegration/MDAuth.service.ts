import axios from 'axios';

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
  private readonly apiUrl = 'https://api.mdintegrations.com/v1';

  async generateToken(): Promise<TokenResponse> {
    const requestBody: TokenRequest = {
      grant_type: 'client_credentials',
      client_id: process.env.MD_INTEGRATIONS_CLIENT_ID!,
      client_secret: process.env.MD_INTEGRATIONS_CLIENT_SECRET!,
      scope: '*'
    };

    const response = await axios.post<TokenResponse>(
      `${this.apiUrl}/partner/auth/token`,
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