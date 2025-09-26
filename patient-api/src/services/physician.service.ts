import Physician from '../models/Physician';
import User from '../models/User';
import { Op } from 'sequelize';
import PharmacyPhysicianService from './pharmacy/physician';

type PhysicianLicenseType = 'MEDICAL' | 'CONTROLLED_SUBSTANCE_REGISTRATION_(CSR)' | 'PA' | 'ARNP' | 'OD';

const STATE_MAPPING: Record<string, string> = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
};

interface PhysicianLicense {
    state: string; // State abbreviation (e.g., "FL")
    number: string;
    type: PhysicianLicenseType
    expires_on: string;
}

interface CreatePhysicianData {
    firstName: string;
    middleName?: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    street: string;
    street2?: string;
    city: string;
    state: string; // Use state abbreviation (e.g., "FL")
    zip: string;
    licenses: PhysicianLicense[];
    clinicId: string;
}

interface UpdatePhysicianData {
    phoneNumber: string;
    email: string;
    street: string;
    street2?: string;
    city: string;
    state: string; // Use state abbreviation (e.g., "FL")
    zip: string;
    licenses: PhysicianLicense[];
}

class PhysicianService {
    private pharmacyPhysicianService: PharmacyPhysicianService;

    constructor() {
        this.pharmacyPhysicianService = new PharmacyPhysicianService();
    }
    async findPhysicianByState(state: string): Promise<Physician | null> {
        // Convert full state name to abbreviation if needed
        const stateAbbr = STATE_MAPPING[state] || state;

        const physician = await Physician.findOne({
            where: {
                active: true,
                [Op.or]: [
                    // Check if physician has a valid license in the state (using abbreviation)
                    {
                        licenses: {
                            [Op.contains]: [
                                {
                                    state: stateAbbr
                                }
                            ]
                        }
                    },
                    // Check if physician's practice address is in the state (using abbreviation)
                    { state: stateAbbr }
                ]
            },
            order: [['createdAt', 'ASC']] // Return the first/oldest physician found
        });

        // Additional validation to ensure physician has valid (non-expired) licenses in the state
        if (physician) {
            const hasValidLicenseInState = physician.licenses.some(license => {
                if (license.state !== stateAbbr) return false;

                const expiresOn = new Date(license.expires_on);
                const now = new Date();
                return expiresOn > now;
            });

            // If physician doesn't have valid license in the state but practice is there, still return
            // If practice is not in the state, require valid license
            if (physician.state !== stateAbbr && !hasValidLicenseInState) {
                return null;
            }
        }

        return physician;
    }

    async createPhysician(physicianData: CreatePhysicianData, userId: string): Promise<Physician> {
        // Validate user has admin role
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.role !== 'admin') {
            throw new Error('Only admin users can create physicians');
        }

        // Convert state to abbreviation if needed
        const stateAbbr = STATE_MAPPING[physicianData.state] || physicianData.state;

        // Convert license states to abbreviations if needed
        const normalizedLicenses = physicianData.licenses.map(license => ({
            ...license,
            state: STATE_MAPPING[license.state] || license.state
        }));

        const physician = await Physician.create({
            firstName: physicianData.firstName,
            middleName: physicianData.middleName,
            lastName: physicianData.lastName,
            phoneNumber: physicianData.phoneNumber,
            email: physicianData.email,
            street: physicianData.street,
            street2: physicianData.street2,
            city: physicianData.city,
            state: stateAbbr,
            zip: physicianData.zip,
            licenses: normalizedLicenses,
            clinicId: physicianData.clinicId,
            active: true
        });

        // Create physician in pharmacy system
        const pharmacyResult = await this.pharmacyPhysicianService.createPhysician({
            ...physician.toPharmacyFormat()
        });

        if (pharmacyResult.success && pharmacyResult.data?.id) {
            // Update physician with pharmacy ID
            await physician.update({
                pharmacyPhysicianId: pharmacyResult.data.id.toString()
            });
        }

        return physician;
    }

    async updatePhysician(physicianId: string, updateData: UpdatePhysicianData, userId: string): Promise<Physician> {
        // Validate user has admin role
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.role !== 'admin') {
            throw new Error('Only admin users can update physicians');
        }

        // Get physician
        const physician = await Physician.findByPk(physicianId);
        if (!physician) {
            throw new Error('Physician not found');
        }

        // Convert state to abbreviation if needed
        const stateAbbr = STATE_MAPPING[updateData.state] || updateData.state;

        // Convert license states to abbreviations if needed
        const normalizedLicenses = updateData.licenses.map(license => ({
            ...license,
            state: STATE_MAPPING[license.state] || license.state
        }));

        // Update physician in local database
        await physician.update({
            phoneNumber: updateData.phoneNumber,
            email: updateData.email,
            street: updateData.street,
            street2: updateData.street2,
            city: updateData.city,
            state: stateAbbr,
            zip: updateData.zip,
            licenses: normalizedLicenses
        });

        // Update physician in pharmacy system if pharmacyPhysicianId exists
        if (physician.pharmacyPhysicianId) {
            const pharmacyResult = await this.pharmacyPhysicianService.updatePhysician(
                parseInt(physician.pharmacyPhysicianId),
                {
                    phone_number: updateData.phoneNumber,
                    email: updateData.email,
                    street: updateData.street,
                    street_2: updateData.street2,
                    city: updateData.city,
                    state: stateAbbr,
                    zip: updateData.zip,
                    licenses: normalizedLicenses
                }
            );

            if (!pharmacyResult.success) {
                console.warn('Failed to update physician in pharmacy system:', pharmacyResult.error);
                // Continue with local update even if pharmacy update fails
            }
        }

        return physician;
    }
}

export default PhysicianService;
export { CreatePhysicianData, UpdatePhysicianData, PhysicianLicenseType };