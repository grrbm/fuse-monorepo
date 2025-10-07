import User from '../models/User';
import { getUser, updateUser } from './db/user';
import PatientService, { CreatePatientRequest, PatientAddress } from './pharmacy/patient';
import { ShippingAddressService, AddressData } from './shippingAddress.service';
import ShippingAddress from '../models/ShippingAddress';
import MDPatientService from './mdIntegration/MDPatient.service';
import MDAuthService from './mdIntegration/MDAuth.service';
import { MDGender, MDPhoneType } from './mdIntegration/MDPatient.service';
import { StripeService } from '@fuse/stripe';



interface UserToPhysicianValidationResult {
    valid: boolean;
    missingFields: string[];
    errorMessage?: string;
}

class UserService {
    private patientService: PatientService;
    private stripeService: StripeService;

    constructor() {
        this.patientService = new PatientService();
        this.stripeService = new StripeService();
    }

    async getOrCreateCustomerId(user: User, metadata?: Record<string, string>): Promise<string> {
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
           

            const stripeCustomer = await this.stripeService.createCustomer(user.email
                , `${user.firstName} ${user.lastName}`,
                metadata || {}
            );

            await user.update({
                stripeCustomerId: stripeCustomer.id
            });

            stripeCustomerId = stripeCustomer.id;
        }

        return stripeCustomerId;
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

    async updateUserPatient(userId: string, updateData: Partial<User>, addressData?: AddressData) {
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
export type {  UserToPhysicianValidationResult };