import cron, { ScheduledTask } from 'node-cron';
import { Op } from 'sequelize';
import Prescription from '../../models/Prescription';
import User from '../../models/User';
import SequenceTriggerService from './SequenceTriggerService';

/**
 * Worker that checks for expired prescriptions daily
 * and triggers sequences for prescription_expired event
 */
export default class PrescriptionExpirationWorker {
  private triggerService: SequenceTriggerService;
  private isRunning = false;
  private cronJob: ScheduledTask | null = null;

  constructor() {
    this.triggerService = new SequenceTriggerService();
  }

  /**
   * Start the cron job to check for expired prescriptions
   * Runs every day at 9:00 AM
   */
  start() {
    if (this.cronJob) {
      console.log('⚠️ PrescriptionExpirationWorker already started');
      return;
    }

    // Schedule: Every day at 9:00 AM
    // Format: second minute hour day month weekday
    this.cronJob = cron.schedule('0 9 * * *', async () => {
      await this.checkExpiredPrescriptions();
    });

    console.log('✅ PrescriptionExpirationWorker started (runs daily at 9:00 AM)');
    
    // Run immediately on startup (for testing/development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Running initial prescription check (development mode)...');
      // Run after 10 seconds to allow app to fully initialize
      setTimeout(() => {
        this.checkExpiredPrescriptions().catch(err => {
          console.error('❌ Initial prescription check failed:', err);
        });
      }, 10000);
    }
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('🛑 PrescriptionExpirationWorker stopped');
    }
  }

  /**
   * Check for expired prescriptions and trigger sequences
   */
  async checkExpiredPrescriptions(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Prescription check already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      console.log('🔍 Checking for expired prescriptions...');

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      // Find prescriptions that expired today or in the past
      // and haven't been processed yet
      const expiredPrescriptions = await Prescription.findAll({
        where: {
          expiresAt: {
            [Op.lte]: today
          }
        },
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'clinicId'],
            required: true
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      if (expiredPrescriptions.length === 0) {
        console.log('✅ No expired prescriptions found');
        return;
      }

      console.log(`📋 Found ${expiredPrescriptions.length} expired prescription(s)`);

      let triggeredCount = 0;
      const processedPrescriptionIds = new Set<string>();

      for (const prescription of expiredPrescriptions) {
        try {
          // Skip if already processed (prevent duplicate triggers)
          if (processedPrescriptionIds.has(prescription.id)) {
            continue;
          }

          const patient = prescription.patient;
          const doctor = prescription.doctor;

          if (!patient || !patient.clinicId) {
            console.warn(`⚠️ Prescription ${prescription.id} has no valid patient or clinic`);
            continue;
          }

          const doctorName = doctor
            ? `${doctor.firstName} ${doctor.lastName}`
            : 'Your Doctor';

          console.log(
            `📤 Triggering prescription_expired for patient ${patient.firstName} ${patient.lastName} (${patient.email})`
          );

          // Trigger sequences for this expired prescription
          const sequencesTriggered = await this.triggerService.triggerPrescriptionExpired(
            patient.id,
            patient.clinicId,
            prescription.id,
            prescription.name,
            prescription.expiresAt,
            doctorName,
            {
              firstName: patient.firstName,
              lastName: patient.lastName,
              email: patient.email,
              phoneNumber: patient.phoneNumber
            }
          );

          if (sequencesTriggered > 0) {
            triggeredCount += sequencesTriggered;
            processedPrescriptionIds.add(prescription.id);
            
            console.log(
              `✅ Triggered ${sequencesTriggered} sequence(s) for prescription "${prescription.name}"`
            );
          } else {
            console.log(
              `ℹ️ No active sequences found for prescription_expired trigger (prescription: ${prescription.name})`
            );
          }
        } catch (error) {
          console.error(`❌ Error processing prescription ${prescription.id}:`, error);
        }
      }

      console.log(
        `✅ Prescription expiration check complete: ${triggeredCount} sequence(s) triggered for ${processedPrescriptionIds.size} prescription(s)`
      );
    } catch (error) {
      console.error('❌ Error checking expired prescriptions:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger a check (for testing or manual execution)
   */
  async triggerManualCheck(): Promise<void> {
    console.log('🔧 Manual prescription check triggered');
    await this.checkExpiredPrescriptions();
  }
}

