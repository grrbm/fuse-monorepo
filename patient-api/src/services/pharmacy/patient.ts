import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';

interface PatientAllergy {
  name: string;
}

interface PatientDisease {
  name: string;
}

interface PatientMedication {
  name: string;
  strength: string;
}

interface PatientAddress {
  street: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
}

interface CreatePatientRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string; // Format: YYYY-MM-DD
  gender: string;
  allergies: PatientAllergy[];
  diseases: PatientDisease[];
  medications: PatientMedication[];
  email: string;
  phone_number: string; // The phone number must be 10 characters
  address: PatientAddress;
}


class PatientService {
  private config: PharmacyApiConfig;

  constructor() {
    this.config = config
  }

  async createPatient(patientData: CreatePatientRequest): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.baseUrl}/api/clinics/patients`,
        patientData,
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
      console.error('Error creating patient:', error);

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

  async updatePatient(patientId: number, patientData: CreatePatientRequest): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.put(
        `${this.config.baseUrl}/api/clinics/patients/${patientId}`,
        patientData,
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
      console.error('Error updating patient:', error);

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

export default PatientService;
export {
  CreatePatientRequest,
  PatientAllergy,
  PatientDisease,
  PatientMedication,
  PatientAddress,
};