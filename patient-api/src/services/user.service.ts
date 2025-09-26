import User from '../models/User';
import { getUser, updateUser } from './db/user';
import PatientService, { CreatePatientRequest, PatientAddress } from './pharmacy/patient';
import { ShippingAddressService, AddressData } from './shippingAddress.service';
import ShippingAddress from '../models/ShippingAddress';
import MDPatientService from './mdIntegration/MDPatient.service';
import MDAuthService from './mdIntegration/MDAuth.service';
import { MDGender, MDPhoneType } from './mdIntegration/MDPatient.service';

interface UserToPatientValidationResult {
    valid: boolean;
    missingFields: string[];
    errorMessage?: string;
}

interface UserToPhysicianValidationResult {
    valid: boolean;
    missingFields: string[];
    errorMessage?: string;
}

class UserService {
    private patientService: PatientService;

    constructor() {
        this.patientService = new PatientService();
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

    private mapGenderToMDFormat(gender: string): MDGender {
        const genderLower = gender.toLowerCase();
        switch (genderLower) {
            case 'male':
            case 'm':
                return 1;
            case 'female':
            case 'f':
                return 2;
            case 'not applicable':
            case 'n/a':
                return 9;
            default:
                return 0; // not known
        }
    }

    private validatePhoneTypeForMD(): MDPhoneType {
        // Default to cell phone (2) as most common
        // In the future, this could be determined from user preferences or phone number analysis
        return 2; // cell phone
    }

    private formatPhoneNumberToUS(phoneNumber: string): string {
        // Remove all non-digit characters
        const digits = phoneNumber.replace(/[^0-9]/g, '');

        // Handle different input formats
        if (digits.length === 10) {
            // Format: 1234567890 -> (123) 456-7890 format
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
            // Format: 11234567890 -> (123) 456-7890 format (remove country code)
            const areaCode = digits.slice(1, 4);
            const exchange = digits.slice(4, 7);
            const number = digits.slice(7);
            return `(${areaCode}) ${exchange}-${number}`;
        } else {
            // Fallback: use original format if can't parse correctly
            return phoneNumber;
        }
    }

    async mapUserToMDPatientRequest(user: User, addressId?: string) {
        let address;

        if (addressId) {
            // Use shipping address if provided
            const shippingAddress = await ShippingAddress.findOne({
                where: { id: addressId, userId: user.id }
            });

            if (shippingAddress) {
                address = {
                    address: shippingAddress.address,
                    address2: shippingAddress.apartment || undefined,
                    city_name: shippingAddress.city,
                    state_name: shippingAddress.state,
                    zip_code: shippingAddress.zipCode
                };
            }
        }

        // Fallback to user's address if no shipping address
        if (!address) {
            address = {
                address: user.address!,
                city_name: user.city!,
                state_name: user.state!,
                zip_code: user.zipCode!
            };
        }

        return {
            first_name: user.firstName!,
            last_name: user.lastName!,
            email: user.email!,
            date_of_birth: user.dob!,
            gender: this.mapGenderToMDFormat(user.gender!),
            phone_number: this.formatPhoneNumberToUS(user.phoneNumber!),
            phone_type: this.validatePhoneTypeForMD(),
            address: address,
            allergies: user.allergies?.map(allergy => allergy.name).join(', ') || '',
            current_medications: user.medications?.map(med => med.name).join(', ') || '',
            medical_conditions: user.diseases?.map(disease => disease.name).join(', ') || ''
        };
    }

    async syncPatientFromUser(userId: string, addressId?: string) {
        try {
            const user = await getUser(userId);

            if (!user) {
                throw Error("User not found")
            }

            const validation = this.validateUserForPatientCreation(user);

            if (!validation.valid) {
                return null
            }

            const patientRequest = await this.mapUserToPatientRequest(user, addressId);

            // Check if user already has a pharmacy patient ID
            if (!user.pharmacyPatientId) {
                // Create new patient
                const result = await this.patientService.createPatient(patientRequest);

                // If creation successful, save the pharmacy patient ID to user
                if (result.success && result.data?.id) {
                    await User.update(
                        { pharmacyPatientId: result.data.id },
                        { where: { id: userId } }
                    );
                }


            } else {
                // Update existing patient
                await this.patientService.updatePatient(
                    parseInt(user.pharmacyPatientId),
                    patientRequest
                );
            }

            user.reload()
            return user
        } catch (error) {
            console.error('Error syncing patient from user:', error);
        }
    }

    async syncPatientInMD(userId: string, addressId?: string) {
        try {
            const user = await getUser(userId);

            if (!user) {
                throw Error("User not found")
            }

            // Sync with MD Integration system

            const tokenResponse = await MDAuthService.generateToken();
            const mdPatientRequest = await this.mapUserToMDPatientRequest(user, addressId);

            if (!user.mdPatientId) {
                // Create new patient in MD Integration
                const mdResult = await MDPatientService.createPatient(mdPatientRequest, tokenResponse.access_token);

                console.log(" mdResult", mdResult)
                if (mdResult.patient_id) {
                    await User.update(
                        { mdPatientId: mdResult.patient_id },
                        { where: { id: userId } }
                    );
                    console.log('✅ Created MD Integration patient:', mdResult.patient_id);
                }
            } else {
                // Update existing patient in MD Integration
                await MDPatientService.updatePatient(user.mdPatientId, mdPatientRequest, tokenResponse.access_token);
                console.log('✅ Updated MD Integration patient:', user.mdPatientId);
            }


            await user.reload();
            return user;
        } catch (error) {
            console.error('❌ Error syncing with MD Integration:', error);
            return null;
        }
    }

    async isUserVerified(userId: string): Promise<boolean> {
        try {
            const user = await getUser(userId);
            if (!user) {
                console.log('❌ User not found:', userId);
                return false;
            }

            if (!user.mdPatientId) {
                console.log('ℹ️ User has no MD Integration patient ID:', userId);
                return false;
            }

            // Get access token and fetch patient details from MD Integration
            const tokenResponse = await MDAuthService.generateToken();
            const patientDetails = await MDPatientService.getPatient(user.mdPatientId, tokenResponse.access_token);

            // Check if driver_license exists and is not null
            const isVerified = patientDetails.driver_license !== null && patientDetails.driver_license !== undefined;

            console.log(`🔍 User verification status for ${userId}:`, {
                mdPatientId: user.mdPatientId,
                hasDriverLicense: isVerified,
                driverLicenseData: patientDetails.driver_license
            });

            return isVerified;

        } catch (error) {
            console.error('❌ Error checking user verification status:', error);
            return false;
        }
    }

    async verifyUserAccount(userId: string) {
        try {

            // Get user to check if they have mdPatientId
            const user = await getUser(userId);
            if (!user || !user.mdPatientId) {
                return {
                    success: false,
                    message: "User not synced with MD Integration. Please try updating your profile first.",
                    error: "Missing mdPatientId"
                };
            }

            // Get MD Integration access token and retrieve driver's license info
            const tokenResponse = await MDAuthService.generateToken();
            const driversLicenseData = await MDPatientService.getDriversLicense(
                user.mdPatientId,
                tokenResponse.access_token
            );

            return {
                success: true,
                message: "Account verification data retrieved successfully",
                data: {
                    drivers_license_url: driversLicenseData.drivers_license_url,
                    verification_code: driversLicenseData.verification_code,
                }
            };

        } catch (error) {
            console.error('❌ Error verifying patient account:', error);
            return {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async updateUserPatient(userId: string, updateData: Partial<User>, addressData?: AddressData,) {
        try {
            const user = await getUser(userId);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Validate user is a patient
            if (user.role !== 'patient') {
                return {
                    success: false,
                    error: "Only patient users can be updated through this method"
                };
            }

            // Remove email from updateData to avoid issues when changing email
            // TODO: Migrate this into a better strategy to sanitize payload
            const { email, clinicId, createdAt, updatedAt, passwordHash, role, ...safeUpdateData } = updateData;

            // Update user in database
            await updateUser(userId, safeUpdateData);

            // Handle address update/creation if address data is provided
            let addressId = addressData?.addressId;
            if (addressData) {
                const updatedAddress = await ShippingAddressService.updateOrCreateAddress(
                    userId,
                    addressData,
                );
                addressId = updatedAddress.id;
            }

            // Attempt to sync patient data with pharmacy
            await this.syncPatientInMD(userId, addressId);

            return {
                success: true,
                message: "User updated successfully",
            };

        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }



    // Might not be used for now. as we will only use one physician to approve orders
    async updateUserDoctor(userId: string, updateData: Partial<User>) {
        try {
            const user = await getUser(userId);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Validate user is a doctor
            if (user.role !== 'doctor') {
                return {
                    success: false,
                    error: "Only doctor users can be updated through this method"
                };
            }

            // Update user in database
            await updateUser(userId, updateData);


            return {
                success: true,
                message: "Doctor updated successfully",
            };

        } catch (error) {
            console.error('Error updating doctor:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}

export default UserService;
export { UserToPatientValidationResult, UserToPhysicianValidationResult };