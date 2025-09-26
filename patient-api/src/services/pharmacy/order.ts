import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';

interface PharmacyProduct {
  sku: number;
  quantity: number;
  refills: number;
  days_supply: number;
  sig: string;
  medical_necessity: string;
}

interface CreateOrderRequest {
  patient_id: number;
  physician_id: number;
  ship_to_clinic: 0 | 1; // 1 = Yes, 0 = No
  service_type: string;
  signature_required: number;
  memo: string;
  external_id?: string;
  test_order: 0 | 1; // 1 for testing
  products: PharmacyProduct[];
}



interface UpdatePatientAddressRequest {
  full: string;
  street: string;
  street_2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

class OrderService {
  private config: PharmacyApiConfig;

  constructor() {
    this.config = config
  }

  async createOrder(orderData: CreateOrderRequest): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.baseUrl}/api/clinics/orders`,
        {
          ...orderData,
          clinicId: this.config.clinicId
        },
        {
          params: {
            api_key: this.config.apiKey
          },
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating pharmacy order:', error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
          message: `HTTP ${error.response?.status}: ${error.response?.statusText}`
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getOrder(orderId: number): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.baseUrl}/api/clinics/orders/${orderId}`,
        {
          params: {
            api_key: this.config.apiKey
          },
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching pharmacy order:', error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
          message: `HTTP ${error.response?.status}: ${error.response?.statusText}`
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updatePatientAddress(orderId: number, addressData: UpdatePatientAddressRequest): Promise<PharmacyApiResponse> {
    try {
      const requestData = {
        api_key: this.config.apiKey,
        ...addressData
      };

      const response: AxiosResponse = await axios.put(
        `${this.config.baseUrl}/api/clinics/orders/${orderId}/patient-address`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating patient address:', error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
          message: `HTTP ${error.response?.status}: ${error.response?.statusText}`
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deleteOrder(orderId: number): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.config.baseUrl}/api/clinics/orders/${orderId}`,
        {
          params: {
            api_key: this.config.apiKey
          },
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Orders can only be deleted (cancelled) as long as they have not been shipped.
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting pharmacy order:', error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
          message: `HTTP ${error.response?.status}: ${error.response?.statusText}`
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default OrderService;
export { CreateOrderRequest, PharmacyProduct, UpdatePatientAddressRequest };