import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';
import Physician, { PhysicianLicense } from '../../models/Physician';
import Order from '../../models/Order';
import { Op } from 'sequelize';

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
  // licenses: PhysicianLicense[];
  npi_number: number;
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

  async getPhysicians(filters?: { npi_number?: string }): Promise<PharmacyApiResponse> {
    try {
      const params = {
        api_key: this.config.apiKey,
        ...filters
      };

      console.log('🔍 GET request params:', params);

      const response: AxiosResponse = await axios.get(
        `${this.config.baseUrl}/api/clinics/physicians`,
        {
          params,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ GET physicians response:', {
        status: response.status,
        dataCount: response.data?.data?.length || 0,
        data: JSON.stringify(response.data, null, 2)
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error fetching physicians:', error);

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

  async postPhysician(physicianData: CreatePhysicianRequest): Promise<PharmacyApiResponse> {
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
      console.error('❌ Error creating physician:', error);

      if (axios.isAxiosError(error)) {
        console.error('🔍 AbsoluteRX API Response:', JSON.stringify(error.response?.data, null, 2));
        return {
          success: false,
          error: error.response?.data?.message || error.message,
          validationErrors: error.response?.data?.errors,
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
  async createPhysician(order: Order) {
    // Use the physician ID from environment variable (PHARMACY_PHYSICIAN_ID)
    const pharmacyPhysicianId = this.config.physicianId;
    const physician = this.config.physician;

    console.log(`👨‍⚕️ Using AbsoluteRX physician ID: ${pharmacyPhysicianId}`);

    // Check if physician already exists in our database by pharmacyPhysicianId
    let physicianRecord = await Physician.findOne({
      where: { pharmacyPhysicianId: pharmacyPhysicianId }
    });

    if (!physicianRecord) {
      // Create physician record in our database linked to the AbsoluteRX physician
      physicianRecord = await Physician.create({
        firstName: physician.firstName,
        lastName: physician.lastName,
        middleName: '',
        email: physician.email,
        phoneNumber: physician.phoneNumber.replace(/[^0-9]/g, ''),
        street: '100 Powell Place #1859',
        city: 'Nashville',
        state: 'TN',
        zip: '37204',
        licenses: [],
        pharmacyPhysicianId: pharmacyPhysicianId
      });

      console.log('✅ Created physician record in database:', physicianRecord.id, physicianRecord.fullName);
    } else {
      console.log(`✅ Using existing physician from database: ${physicianRecord.id}, ${physicianRecord.fullName}`);
    }

    // Link physician to order
    await order.update({ physicianId: physicianRecord.id });
  }
}

export default PharmacyPhysicianService;
export type {
  CreatePhysicianRequest,
  PhysicianLicense,
};