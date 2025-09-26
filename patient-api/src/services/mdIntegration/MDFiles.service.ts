import axios from 'axios';
import FormData from 'form-data';
import MDAuthService from './MDAuth.service';

interface FileResponse {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  url: string;
  created_at: string;
  updated_at: string;
}

class MDFilesService {
  private readonly apiUrl = 'https://api.mdintegrations.com/v1';

  private async getAuthHeaders() {
    const tokenData = await MDAuthService.generateToken();
    return {
      'Authorization': `${tokenData.token_type} ${tokenData.access_token}`
    };
  }

  async createFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<FileResponse> {
    const headers = await this.getAuthHeaders();

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType
    });

    const response = await axios.post<FileResponse>(
      `${this.apiUrl}/partner/files`,
      formData,
      {
        headers: {
          ...headers,
          ...formData.getHeaders()
        }
      }
    );

    return response.data;
  }

  async getFile(fileId: string): Promise<FileResponse> {
    const headers = await this.getAuthHeaders();

    const response = await axios.get<FileResponse>(
      `${this.apiUrl}/partner/files/${fileId}`,
      { headers }
    );

    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    await axios.delete(
      `${this.apiUrl}/partner/files/${fileId}`,
      { headers }
    );
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const headers = await this.getAuthHeaders();

    const response = await axios.get(
      `${this.apiUrl}/partner/files/${fileId}`,
      {
        headers,
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  }
}

export default new MDFilesService();