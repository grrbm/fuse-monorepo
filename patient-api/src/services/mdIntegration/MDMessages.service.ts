import axios from 'axios';
import MDAuthService from './MDAuth.service';
import { resolveMdIntegrationsBaseUrl } from './config';

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
  private readonly apiUrl = resolveMdIntegrationsBaseUrl('');

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

    const response = await axios.get<MessagesResponse>(
      `${resolveMdIntegrationsBaseUrl(`/partner/patients/${patientId}/messages`)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      { headers }
    );

    return response.data;
  }

  async createMessage(patientId: string, payload: CreateMessagePayload): Promise<Message> {
    const headers = await this.getAuthHeaders();

    const response = await axios.post<Message>(
      resolveMdIntegrationsBaseUrl(`/partner/patients/${patientId}/messages`),
      payload,
      { headers }
    );

    return response.data;
  }

  async markMessageAsRead(patientId: string, messageId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    await axios.post(
      resolveMdIntegrationsBaseUrl(`/partner/patients/${patientId}/messages/${messageId}/read`),
      {},
      { headers }
    );
  }

  async markMessageAsUnread(patientId: string, messageId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    await axios.delete(
      resolveMdIntegrationsBaseUrl(`/partner/patients/${patientId}/messages/${messageId}/unread`),
      { headers }
    );
  }
}

export default new MDMessagesService();