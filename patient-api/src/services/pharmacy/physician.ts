import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';
import { PhysicianLicense } from '../../models/Physician';

interface CreatePhysicianRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone_number: string;
  email: string;
  street: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  licenses: PhysicianLicense[];
}

interface UpdatePhysicianRequest {
  phone_number: string;
  email: string;
  street: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  licenses: PhysicianLicense[];
}



class PharmacyPhysicianService {
  private config: PharmacyApiConfig;

  constructor() {
    this.config = config;
  }

  async createPhysician(physicianData: CreatePhysicianRequest): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.baseUrl}/api/clinics/physicians`,
        physicianData,
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
      console.error('Error creating physician:', error);

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

  async updatePhysician(physicianId: number, physicianData: UpdatePhysicianRequest): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.put(
        `${this.config.baseUrl}/api/clinics/physicians/${physicianId}`,
        physicianData,
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
      console.error('Error updating physician:', error);

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

export default PharmacyPhysicianService;
export {
  CreatePhysicianRequest,
  PhysicianLicense,
};