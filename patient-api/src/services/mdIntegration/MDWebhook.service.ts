import Order from '../../models/Order';
import OrderService from '../order.service';
import MDAuthService from './MDAuth.service';
import MDCaseService from './MDCase.service';
import MDClinicianService from './MDClinician.service';
import Physician from '../../models/Physician';
import PharmacyPhysicianService from '../pharmacy/physician';
import User from '../../models/User';


interface Product {
  id: string;
  ndc: string | null;
  otc: string | null;
  upc: string | null;
  name: string;
  title: string;
  refills: number;
  metadata: string | null;
  quantity: string;
  created_at: string;
  deleted_at: string | null;
  directions: string;
  updated_at: string;
  days_supply: number | null;
  is_obsolete: boolean | null;
  pharmacy_id: string | null;
  dispense_unit: string;
  pharmacy_name: string | null;
  effective_date: string | null;
  force_pharmacy: boolean;
  pharmacy_notes: string;
  dispense_unit_id: number;
  dosespot_supply_id: number;
}

interface Offering {
  id: string;
  case_offering_id: string;
  title: string;
  name: string;
  directions: string;
  is_additional_approval_needed: boolean;
  thank_you_note: string;
  clinical_note: string;
  status: string;
  status_details: string | null;
  order: number;
  is_important: boolean;
  offerable_type: string;
  offerable_id: string;
  order_status: string | null;
  order_date: string | null;
  order_details: string | null;
  order_updated: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: Product;
  product_id: string;
  product_type: string;
}

interface OfferingSubmittedEvent {
  timestamp: number;
  event_type: 'offering_submitted';
  case_id: string;
  metadata: string;
  offerings: Offering[];
}

interface IntroVideoRequestedEvent {
  event_type: 'intro_video_requested';
  access_link: string;
  patient_id: string;
  metadata: string;
}

interface DriversLicenseRequestedEvent {
  timestamp: number;
  event_type: 'drivers_license_requested';
  access_link: string;
  patient_id: string;
  metadata: string;
}

interface MessageCreatedEvent {
  timestamp: number;
  event_type: 'message_created';
  message_id: string;
  patient_id: string;
  user_type: string;
  channel: string;
}

class MDWebhookService {
  // This event will be dispatched when a treatment is approved and ready to be ordered, depending on the offering type:
  async handleOfferingSubmitted(eventData: OfferingSubmittedEvent): Promise<void> {
    console.log('🩺 MD Integration offering submitted:', eventData.case_id);

    try {
      // Find order by mdCaseId
      const order = await Order.findOne({
        where: { mdCaseId: eventData.case_id }
      });

      if (!order) {
        console.log('⚠️ Order not found for case ID:', eventData.case_id);
        return;
      }

      console.log('✅ Processing offering submitted for order:', order.orderNumber);

      // Get MD Integration access token and fetch case details
      const tokenResponse = await MDAuthService.generateToken();
      const caseDetails = await MDCaseService.getCase(eventData.case_id, tokenResponse.access_token);

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
        // Convert practice areas to license format
        const convertedLicenses = clinicianDetails.practice_areas.map(practiceArea => ({
          state: practiceArea.state.abbreviation,
          number: practiceArea.license_number,
          type: 'medical_license',
          expires_on: practiceArea.expires_at
        }));

        // Add NPI licenses
        const npiLicenses = clinicianDetails.licenses
          .filter(license => license.type === 'npi')
          .map(license => ({
            state: 'NATIONAL',
            number: license.value,
            type: 'npi',
            expires_on: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }));

        const allLicenses = [...convertedLicenses, ...npiLicenses];

        physician = await Physician.create({
          firstName: clinicianDetails.first_name,
          lastName: clinicianDetails.last_name,
          middleName: '', // Not provided by MD Integration
          email: clinicianDetails.email,
          phoneNumber: clinicianDetails.phone_number.replace(/[^0-9]/g, ''), // Remove formatting
          street: 'MD Integration Provider', // Placeholder - address not in API
          city: 'Remote',
          state: 'CA', // Default state
          zip: '00000', // Placeholder
          licenses: allLicenses,
          active: clinicianDetails.active && !clinicianDetails.is_out_of_office,
          mdPhysicianId: clinicianDetails.clinician_id
        });

        console.log('✅ Created new physician:', physician.id, physician.fullName);

        // Create physician in pharmacy system
        try {
          const pharmacyPhysicianService = new PharmacyPhysicianService();
          const pharmacyResponse = await pharmacyPhysicianService.createPhysician({
            first_name: clinicianDetails.first_name,
            middle_name: '', // Not provided by MD Integration
            last_name: clinicianDetails.last_name,
            phone_number: clinicianDetails.phone_number.replace(/[^0-9]/g, ''),
            email: clinicianDetails.email,
            // TODO: Solve the address
            street: 'MD Integration Provider',
            city: 'Remote',
            state: 'CA',
            zip: '00000',
            licenses: allLicenses
          });

          if (pharmacyResponse.success && pharmacyResponse.data?.physician_id) {
            // Update physician with pharmacy ID
            await physician.update({
              pharmacyPhysicianId: pharmacyResponse.data.physician_id
            });
            console.log('✅ Created physician in pharmacy system:', pharmacyResponse.data.physician_id);
          } else {
            console.log('⚠️ Failed to create physician in pharmacy system:', pharmacyResponse.message);
          }
        } catch (pharmacyError) {
          console.error('❌ Error creating physician in pharmacy system:', pharmacyError);
        }
      } else {
        console.log('ℹ️ Using existing physician:', physician.id, physician.fullName);
      }

      // Link physician to order
      await order.update({ physicianId: physician.id });

      // Approve the order with the assigned physician
      const orderService = new OrderService();
      await orderService.approveOrder(order.id, physician.id);
      console.log('✅ Order approved with physician:', order.orderNumber);

    } catch (error) {
      console.error('❌ Error processing offering submitted:', error);
      throw error;
    }
  }

  async handleIntroVideoRequested(eventData: IntroVideoRequestedEvent): Promise<void> {
    console.log('🎥 MD Integration intro video requested:', eventData.patient_id);

    try {
      // Find user by mdPatientId
      const user = await User.findOne({
        where: { mdPatientId: eventData.patient_id }
      });

      if (!user) {
        console.log('⚠️ User not found for MD patient ID:', eventData.patient_id);
        return;
      }

      console.log('✅ Processing intro video request for user:', user.id);



      console.log('📋 Intro video details:', {
        userId: user.id,
        patientId: eventData.patient_id,
        accessLink: eventData.access_link,
        metadata: eventData.metadata
      });

      // TODO: Send notification to user about intro video request
      // TODO: Store access link for future reference if needed

    } catch (error) {
      console.error('❌ Error processing intro video request:', error);
      throw error;
    }
  }

  async handleDriversLicenseRequested(eventData: DriversLicenseRequestedEvent): Promise<void> {
    console.log('🆔 MD Integration drivers license requested:', eventData.patient_id);

    try {
      // Find user by mdPatientId
      const user = await User.findOne({
        where: { mdPatientId: eventData.patient_id }
      });

      if (!user) {
        console.log('⚠️ User not found for MD patient ID:', eventData.patient_id);
        return;
      }

      console.log('✅ Processing drivers license request for user:', user.id);

      console.log('📋 Drivers license request details:', {
        userId: user.id,
        patientId: eventData.patient_id,
        accessLink: eventData.access_link,
        timestamp: eventData.timestamp,
        metadata: eventData.metadata
      });

      // TODO: Send notification to user about drivers license request
      // TODO: Store access link for future reference if needed
      // TODO: Update user verification status or create verification record

    } catch (error) {
      console.error('❌ Error processing drivers license request:', error);
      throw error;
    }
  }

  async handleMessageCreated(eventData: MessageCreatedEvent): Promise<void> {
    console.log('💬 MD Integration message created:', eventData.message_id);

    try {
      // Find user by mdPatientId
      const user = await User.findOne({
        where: { mdPatientId: eventData.patient_id }
      });

      if (!user) {
        console.log('⚠️ User not found for MD patient ID:', eventData.patient_id);
        return;
      }

      console.log('✅ Processing message created for user:', user.id);

      console.log('📋 Message details:', {
        userId: user.id,
        patientId: eventData.patient_id,
        messageId: eventData.message_id,
        userType: eventData.user_type,
        channel: eventData.channel,
        timestamp: eventData.timestamp
      });

      // TODO: Store message reference for future retrieval
      // TODO: Send push notification to user about new message
      // TODO: Update user's last activity timestamp
      // TODO: Mark user as having active communication

    } catch (error) {
      console.error('❌ Error processing message created:', error);
      throw error;
    }
  }

  async processMDWebhook(eventData: any): Promise<void> {
    switch (eventData.event_type) {
      case 'offering_submitted':
        await this.handleOfferingSubmitted(eventData as OfferingSubmittedEvent);
        break;

      case 'intro_video_requested':
        await this.handleIntroVideoRequested(eventData as IntroVideoRequestedEvent);
        break;

      case 'drivers_license_requested':
        await this.handleDriversLicenseRequested(eventData as DriversLicenseRequestedEvent);
        break;

      case 'message_created':
        await this.handleMessageCreated(eventData as MessageCreatedEvent);
        break;

      default:
        console.log(`🔍 Unhandled MD Integration event type: ${eventData.event_type}`);
    }
  }
}

export default new MDWebhookService();