import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';
import Physician, { PhysicianLicense } from '../../models/Physician';
import Order from '../../models/Order';

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
    // Use test physician from environment variables (no longer using MD Integrations)
    const testPhysician = this.config.testPhysician;
    const npiNumber = testPhysician.npi;

    console.log(`👨‍⚕️ Using test physician NPI: ${npiNumber}`);

    if (!npiNumber || npiNumber === '0000000000') {
      throw new Error("TEST_PHYSICIAN_NPI environment variable not set or invalid");
    }

    // Check if physician already exists in AbsoluteRX by NPI number
    // Note: The GET endpoint doesn't support filtering, so we fetch all and search client-side
    const pharmacyPhysicianService = new PharmacyPhysicianService();
    console.log(`🔍 Checking if physician with NPI ${npiNumber} exists in AbsoluteRX...`);

    const existingPhysiciansResponse = await pharmacyPhysicianService.getPhysicians();

    let pharmacyPhysicianId: string;
    let existingPhysician: any = null;

    // Search for matching NPI in the returned physicians
    if (existingPhysiciansResponse.success &&
      existingPhysiciansResponse.data?.data?.length > 0) {
      existingPhysician = existingPhysiciansResponse.data.data.find(
        (physician: any) => physician.npi_number?.toString() === npiNumber.toString()
      );
    }

    if (existingPhysician) {
      // Physician already exists in AbsoluteRX
      // Convert to string since our DB stores it as VARCHAR
      pharmacyPhysicianId = existingPhysician.id.toString();
      console.log(`✅ Found existing physician in AbsoluteRX with ID: ${pharmacyPhysicianId} (NPI: ${existingPhysician.npi_number})`);
    } else {
      // Create new physician in pharmacy system
      console.log(`📝 Creating new physician in AbsoluteRX...`);
      const pharmacyResponse = await pharmacyPhysicianService.postPhysician({
        first_name: testPhysician.firstName,
        middle_name: '',
        last_name: testPhysician.lastName,
        phone_number: testPhysician.phoneNumber.replace(/[^0-9]/g, ''),
        email: testPhysician.email,
        // Approved address for test physician
        street: '100 Powell Place #1859',
        city: 'Nashville',
        state: 'TN',
        zip: '37204',
        npi_number: +npiNumber
      });

      // Check if pharmacy physician creation was successful
      if (!pharmacyResponse.success || !pharmacyResponse.data?.data?.id) {
        console.error('❌ Failed to create physician in AbsoluteRX:', pharmacyResponse.error);
        throw new Error(`Failed to create physician in pharmacy: ${pharmacyResponse.error}`);
      }

      // Convert to string since our DB stores it as VARCHAR
      pharmacyPhysicianId = pharmacyResponse.data.data.id.toString();
      console.log(`✅ Created new physician in AbsoluteRX with ID: ${pharmacyPhysicianId}`);
    }

    // Check if physician already exists in our database by pharmacyPhysicianId
    let physician = await Physician.findOne({
      where: { pharmacyPhysicianId: pharmacyPhysicianId }
    });

    if (!physician) {
      // Create physician record in our database
      physician = await Physician.create({
        firstName: testPhysician.firstName,
        lastName: testPhysician.lastName,
        middleName: '',
        email: testPhysician.email,
        phoneNumber: testPhysician.phoneNumber.replace(/[^0-9]/g, ''),
        street: '100 Powell Place #1859',
        city: 'Nashville',
        state: 'TN',
        zip: '37204',
        licenses: [],
        pharmacyPhysicianId: pharmacyPhysicianId
      });

      console.log('✅ Created physician record in database:', physician.id, physician.fullName);
    } else {
      console.log(`✅ Using existing physician from database: ${physician.id}, ${physician.fullName}`);
    }

    // Link physician to order
    await order.update({ physicianId: physician.id });
  }
}

export default PharmacyPhysicianService;
export type {
  CreatePhysicianRequest,
  PhysicianLicense,
};