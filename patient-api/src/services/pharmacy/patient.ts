import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';
import User from '../../models/User';
import ShippingAddress from '../../models/ShippingAddress';
import UserPatient from '../../models/UserPatient';
import { PharmacyProvider } from '../../models/Product';

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

interface UserToPatientValidationResult {
  valid: boolean;
  missingFields: string[];
  errorMessage?: string;
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

  validateUserForPatientCreation(user: User): UserToPatientValidationResult {
    const missingFields: string[] = [];

    // Required string fields for CreatePatientRequest
    if (!user.firstName?.trim()) {
      missingFields.push('firstName (first_name)');
    }
    if (!user.lastName?.trim()) {
      missingFields.push('lastName (last_name)');
    }
    if (!user.dob) {
      missingFields.push('dob (date of birth in YYYY-MM-DD format)');
    }
    if (!user.gender?.trim()) {
      missingFields.push('gender');
    }
    if (!user.email?.trim()) {
      missingFields.push('email');
    }
    if (!user.phoneNumber?.trim()) {
      missingFields.push('phoneNumber (phone_number)');
    }

    // Required array fields for CreatePatientRequest
    if (!user.allergies || !Array.isArray(user.allergies)) {
      missingFields.push('allergies (must be an array)');
    }
    if (!user.diseases || !Array.isArray(user.diseases)) {
      missingFields.push('diseases (must be an array)');
    }
    if (!user.medications || !Array.isArray(user.medications)) {
      missingFields.push('medications (must be an array)');
    }

    // Required address fields for CreatePatientRequest
    if (!user.address?.trim()) {
      missingFields.push('address (street)');
    }
    if (!user.city?.trim()) {
      missingFields.push('city');
    }
    if (!user.state?.trim()) {
      missingFields.push('state');
    }
    if (!user.zipCode?.trim()) {
      missingFields.push('zipCode (zip)');
    }

    if (missingFields.length > 0) {
      return {
        valid: false,
        missingFields,
        errorMessage: `Missing required fields for patient creation: ${missingFields.join(', ')}`
      };
    }

    return {
      valid: true,
      missingFields: []
    };
  }

  async mapUserToPatientRequest(user: User, addressId?: string): Promise<CreatePatientRequest> {
    let address: PatientAddress;

    if (addressId) {
      // Use shipping address if provided
      const shippingAddress = await ShippingAddress.findOne({
        where: { id: addressId, userId: user.id }
      });

      if (shippingAddress) {
        address = {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zipCode
        };
      } else {
        // Fallback to user address if shipping address not found
        address = {
          street: user.address!,
          city: user.city!,
          state: user.state!,
          zip: user.zipCode!
        };
      }
    } else {
      // Use user address
      address = {
        street: user.address!,
        city: user.city!,
        state: user.state!,
        zip: user.zipCode!
      };
    }

    return {
      first_name: user.firstName,
      last_name: user.lastName,
      dob: user.dob!, // Format: YYYY-MM-DD
      gender: user.gender!,
      allergies: user.allergies!,
      diseases: user.diseases!,
      medications: user.medications!,
      email: user.email,
      phone_number: user.phoneNumber!.replace(/[^0-9]/g, ''), // Remove all special symbols, keep only digits
      address: address
    };
  }

  async syncPatientFromUser(userId: string, addressId?: string): Promise<string> {

    const user = await User.findByPk(userId);

    if (!user) {
      throw Error("User not found")
    }

    const pharmacyPatient = await UserPatient.findOne({
      where: {
        pharmacyProvider: PharmacyProvider.ABSOLUTERX,
        userId: user.id
      }
    })

    const pharmacyPatientId = pharmacyPatient?.pharmacyPatientId

    const validation = this.validateUserForPatientCreation(user);

    if (!validation.valid) {
      throw Error("Cannot sync patient")
    }

    const patientRequest = await this.mapUserToPatientRequest(user, addressId);

    if (pharmacyPatientId) {
      this.updatePatient(
        parseInt(pharmacyPatientId),
        patientRequest
      );
      return pharmacyPatient.pharmacyPatientId
    } else {

      // Create new patient
      const result = await this.createPatient(patientRequest);

      // If creation successful, save the pharmacy patient ID to user
      if (result.success && result.data?.id) {
        await UserPatient.create(
          {
            userId: userId, pharmacyProvider: PharmacyProvider.ABSOLUTERX,
            pharmacyPatientId: result.data.id
          }
        );
      }
      return result.data.id

    }

  }

}

export default PatientService;
export type {
  CreatePatientRequest,
  PatientAllergy,
  PatientDisease,
  PatientMedication,
  PatientAddress,
};