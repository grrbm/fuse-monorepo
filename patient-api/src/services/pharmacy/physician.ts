import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';
import Physician, { PhysicianLicense } from '../../models/Physician';
import Order from '../../models/Order';
import MDAuthService from '../mdIntegration/MDAuth.service';
import MDCaseService from '../mdIntegration/MDCase.service';
import MDClinicianService from '../mdIntegration/MDClinician.service';

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

    // Get MD Integration access token and fetch case details
    const tokenResponse = await MDAuthService.generateToken();

    if (!order.mdCaseId) {
      throw Error("Case Id not assigned")
    }
    const caseDetails = await MDCaseService.getCase(order.mdCaseId, tokenResponse.access_token);

    // Extract clinician information from case
    const clinician = caseDetails.case_assignment.clinician;

    // Fetch detailed clinician information using the clinician service
    const clinicianDetails = await MDClinicianService.getClinician(
      clinician.clinician_id,
      tokenResponse.access_token
    );

    // Check if physician already exists by mdPhysicianId
    let physician = await Physician.findOne({
      where: { mdPhysicianId: clinicianDetails.clinician_id }
    });

    // Create physician if not exists
    if (!physician) {

      const npiLicenses = clinicianDetails.licenses
        .filter(license => license.type === 'npi');

      const npiNumber = npiLicenses[0]?.value

      if (!npiNumber) {
        throw Error("No Npi number found ini Clinician")
      }

      // Create physician in pharmacy system
      const pharmacyPhysicianService = new PharmacyPhysicianService();
      const pharmacyResponse = await pharmacyPhysicianService.postPhysician({
        first_name: clinicianDetails.first_name,
        middle_name: '', // Not provided by MD Integration
        last_name: clinicianDetails.last_name,
        phone_number: clinicianDetails.phone_number.replace(/[^0-9]/g, ''),
        email: clinicianDetails.email,
        // Approved address for  all MDI clinicians
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

      physician = await Physician.create({
        firstName: clinicianDetails.first_name,
        lastName: clinicianDetails.last_name,
        middleName: '', // Not provided by MD Integration
        email: clinicianDetails.email,
        phoneNumber: clinicianDetails.phone_number.replace(/[^0-9]/g, ''), // Remove formatting
        street: '100 Powell Place #1859',
        city: 'Nashville',
        state: 'TN',
        zip: '37204',
        mdPhysicianId: clinicianDetails.clinician_id,
        pharmacyPhysicianId: pharmacyResponse.data.data.id
      });

      console.log('✅ Created new physician:', physician.id, physician.fullName);
    } else {
      // Link physician to order
      await order.update({ physicianId: physician.id });
    }
  }
}

export default PharmacyPhysicianService;
export type {
  CreatePhysicianRequest,
  PhysicianLicense,
};