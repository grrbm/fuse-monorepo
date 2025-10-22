import axios from 'axios';
import logger from '../../utils/logger';
import MDAuthService from './MDAuth.service';

export interface MessageUser {
  id: string;
  first_name: string;
  last_name: string;
  suffix?: string;
  email: string;
  phone_number?: string;
  phone_type?: string;
  photo_id?: string;
  active: boolean;
  bio_details?: string;
  date_of_birth: string;
  address_id: string;
  specialty?: string;
  fax_number?: string;
  profile_url?: string;
  signature_id?: string;
}

export interface Message {
  id: string;
  patient_id: string;
  channel: string;
  text: string;
  user_type: string;
  user_id: string;
  reference_message_id?: string;
  reply_message_id?: string;
  replied_at?: string;
  dismissed_at?: string;
  dismissed_by_type?: string;
  dismissed_by_id?: string;
  emailed_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  read_message_info?: any;
  reference_message?: any;
  user: MessageUser;
}

export interface MessagesResponse {
  data: Message[];
}

export interface CreateMessagePayload {
  channel: string;
  text?: string;
  reference_message_id?: string;
  files?: { id: string }[];
}

export interface GetMessagesParams {
  page?: number;
  per_page?: number;
  channel?: string;
}

class MDMessagesService {
  private readonly apiUrl = 'https://api.mdintegrations.com/v1';

  private async getAuthHeaders() {
    const tokenData = await MDAuthService.generateToken();
    return {
      'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  async getMessages(patientId: string, params: GetMessagesParams = {}): Promise<MessagesResponse> {
    const headers = await this.getAuthHeaders();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.channel) queryParams.append('channel', params.channel);

    try {
      const response = await axios.get<MessagesResponse>(
        `${this.apiUrl}/partner/patients/${patientId}/messages?${queryParams.toString()}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data || error.message
        : (error as Error).message;

      logger.error('❌ Error fetching MDI messages', {
        patientId,
        params,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        message,
      });

      throw new Error(message || 'Failed to fetch MDI messages');
    }
  }

  async createMessage(patientId: string, payload: CreateMessagePayload): Promise<Message> {
    const headers = await this.getAuthHeaders();

    try {
      const response = await axios.post<Message>(
        `${this.apiUrl}/partner/patients/${patientId}/messages`,
        payload,
        { headers }
      );

      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data || error.message
        : (error as Error).message;

      logger.error('❌ Error creating MDI message', {
        patientId,
        payload,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        message,
      });

      throw new Error(message || 'Failed to create MDI message');
    }
  }

  async markMessageAsRead(patientId: string, messageId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    await axios.post(
      `${this.apiUrl}/partner/patients/${patientId}/messages/${messageId}/read`,
      {},
      { headers }
    );
  }

  async markMessageAsUnread(patientId: string, messageId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    await axios.delete(
      `${this.apiUrl}/partner/patients/${patientId}/messages/${messageId}/unread`,
      { headers }
    );
  }
}

export default new MDMessagesService();