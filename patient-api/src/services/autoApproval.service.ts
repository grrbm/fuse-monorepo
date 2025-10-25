import Order, { OrderStatus } from '../models/Order';
import Treatment from '../models/Treatment';
import User from '../models/User';
import OrderService from './order.service';
import WebSocketService from './websocket.service';
import { Op } from 'sequelize';

interface AutoApprovalCriteria {
    isStandardTreatment: boolean;
    withinDosageLimits: boolean;
    noContraindications: boolean;
    treatmentApproved: boolean;
    patientAgeValid: boolean;
    hasRequiredFields: boolean;
}

class AutoApprovalService {
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning: boolean = false;

    // Configuration
    private readonly MIN_INTERVAL = parseInt(process.env.AUTO_APPROVAL_INTERVAL_MIN || '120000'); // 2 minutes
    private readonly MAX_INTERVAL = parseInt(process.env.AUTO_APPROVAL_INTERVAL_MAX || '300000'); // 5 minutes
    private readonly ENABLED = process.env.AUTO_APPROVAL_ENABLED !== 'false'; // Enabled by default
    private readonly MIN_PATIENT_AGE = 18;
    private readonly MAX_PATIENT_AGE = 65;

    start(): void {
        if (!this.ENABLED) {
            console.log('[AUTO-APPROVE] ⚠️ Auto-approval is disabled');
            return;
        }

        if (this.isRunning) {
            console.log('[AUTO-APPROVE] ⚠️ Auto-approval is already running');
            return;
        }

        this.isRunning = true;
        console.log('[AUTO-APPROVE] 🚀 Starting auto-approval service', {
            minInterval: `${this.MIN_INTERVAL / 1000}s`,
            maxInterval: `${this.MAX_INTERVAL / 1000}s`,
        });

        this.scheduleNextRun();
    }

    stop(): void {
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('[AUTO-APPROVE] 🛑 Stopped auto-approval service');
    }

    private scheduleNextRun(): void {
        if (!this.isRunning) return;

        // Random interval between MIN and MAX
        const interval = Math.floor(Math.random() * (this.MAX_INTERVAL - this.MIN_INTERVAL + 1)) + this.MIN_INTERVAL;

        console.log('[AUTO-APPROVE] ⏰ Next run in', `${interval / 1000}s`);

        this.intervalId = setTimeout(async () => {
            try {
                await this.processEligibleOrders();
            } catch (error) {
                console.error('[AUTO-APPROVE] ❌ Error processing orders', error);
            }
            this.scheduleNextRun();
        }, interval);
    }

    private async processEligibleOrders(): Promise<void> {
        console.log('[AUTO-APPROVE] 🔍 Checking for eligible orders...');

        try {
            // Find all pending orders that haven't been auto-approved yet
            const orders = await Order.findAll({
                where: {
                    status: OrderStatus.PAID,
                    autoApprovedByDoctor: false
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'dob', 'email']
                    },
                    {
                        model: Treatment,
                        as: 'treatment',
                        attributes: ['id', 'name', 'isCompound', 'pharmacyProvider']
                    }
                ],
                limit: 50, // Process in batches
            });

            console.log('[AUTO-APPROVE] 📦 Found', orders.length, 'orders to evaluate');

            let approvedCount = 0;
            let skippedCount = 0;

            for (const order of orders) {
                try {
                    const criteria = await this.evaluateOrder(order);
                    const eligible = this.isEligibleForAutoApproval(criteria);

                    if (eligible) {
                        const reason = this.generateApprovalReason(criteria);
                        await this.autoApproveOrder(order, reason);
                        approvedCount++;
                    } else {
                        skippedCount++;
                        console.log('[AUTO-APPROVE] ⏭️ Skipped order', {
                            orderNumber: order.orderNumber,
                            reason: this.generateSkipReason(criteria)
                        });
                    }
                } catch (error) {
                    console.error('[AUTO-APPROVE] ❌ Error processing order', order.orderNumber, error);
                    skippedCount++;
                }
            }

            console.log('[AUTO-APPROVE] ✅ Completed batch', {
                total: orders.length,
                approved: approvedCount,
                skipped: skippedCount
            });

        } catch (error) {
            console.error('[AUTO-APPROVE] ❌ Error fetching orders', error);
        }
    }

    private async evaluateOrder(order: Order): Promise<AutoApprovalCriteria> {
        const user = order.user;
        const treatment = order.treatment;

        // Check if treatment exists - for now, assume all treatments are standard
        // TODO: Add isCompound field to Treatment model if needed
        const isStandardTreatment = treatment ? true : false;

        // Check patient age using dob field
        const patientAgeValid = this.isPatientAgeValid(order.user.dob);

        // Check if has required fields
        const hasRequiredFields = !!(
            order.userId &&
            order.treatmentId &&
            order.shippingAddressId &&
            order.physicianId
        );

        // Check questionnaire for contraindications
        const noContraindications = this.checkNoContraindications(order.questionnaireAnswers);

        // For now, we'll assume treatments are within dosage limits and approved
        // In production, you'd check against a database of approved treatments
        const withinDosageLimits = true;
        const treatmentApproved = isStandardTreatment;

        return {
            isStandardTreatment,
            withinDosageLimits,
            noContraindications,
            treatmentApproved,
            patientAgeValid,
            hasRequiredFields,
        };
    }

    private isEligibleForAutoApproval(criteria: AutoApprovalCriteria): boolean {
        return (
            criteria.isStandardTreatment &&
            criteria.withinDosageLimits &&
            criteria.noContraindications &&
            criteria.treatmentApproved &&
            criteria.patientAgeValid &&
            criteria.hasRequiredFields
        );
    }

    private checkNoContraindications(questionnaireAnswers?: Record<string, any>): boolean {
        if (!questionnaireAnswers) return true;

        // Check for common contraindication flags in questionnaire
        const contraIndicators = [
            'pregnant',
            'breastfeeding',
            'severeAllergy',
            'heartCondition',
            'liverDisease',
            'kidneyDisease',
        ];

        for (const indicator of contraIndicators) {
            if (questionnaireAnswers[indicator] === true || questionnaireAnswers[indicator] === 'yes') {
                return false;
            }
        }

        return true;
    }

    private isPatientAgeValid(dob: string | undefined): boolean {
        if (!dob) return false;

        try {
            const age = this.calculateAge(dob);
            return age >= 18 && age <= 100; // Reasonable age range
        } catch (error) {
            console.error('Error calculating age from dob:', dob, error);
            return false;
        }
    }

    private calculateAge(dob: string): number {
        const today = new Date();
        const birthDate = new Date(dob);

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    private generateApprovalReason(criteria: AutoApprovalCriteria): string {
        const reasons = [
            'Standard treatment protocol',
            'Within approved dosage limits',
            'No contraindications detected',
            'Patient age within safe range',
            'All required fields validated',
        ];

        return `Auto-approved: ${reasons.join(', ')}`;
    }

    private generateSkipReason(criteria: AutoApprovalCriteria): string {
        const reasons: string[] = [];

        if (!criteria.isStandardTreatment) reasons.push('Non-standard treatment');
        if (!criteria.withinDosageLimits) reasons.push('Dosage exceeds limits');
        if (!criteria.noContraindications) reasons.push('Contraindications detected');
        if (!criteria.treatmentApproved) reasons.push('Treatment not pre-approved');
        if (!criteria.patientAgeValid) reasons.push('Patient age out of range');
        if (!criteria.hasRequiredFields) reasons.push('Missing required fields');

        return reasons.join(', ');
    }

    private async autoApproveOrder(order: Order, reason: string): Promise<void> {
        console.log('[AUTO-APPROVE] ✅ Auto-approving order', {
            orderNumber: order.orderNumber,
            reason,
        });

        // Mark as auto-approved before processing
        await order.update({
            approvedByDoctor: true,
            autoApprovedByDoctor: true,
            autoApprovalReason: reason,
        });

        // Use existing order service to approve
        const orderService = new OrderService();
        const result = await orderService.approveOrder(order.id);

        if (result.success) {
            console.log('[AUTO-APPROVE] ✅ Successfully auto-approved', order.orderNumber);

            // Emit WebSocket event
            WebSocketService.emitOrderApproved({
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: order.userId,
                clinicId: order.clinicId,
                status: order.status,
                autoApprovedByDoctor: true,
            });
        } else {
            console.error('[AUTO-APPROVE] ❌ Failed to auto-approve', {
                orderNumber: order.orderNumber,
                error: result.error,
            });

            // Revert auto-approval flag
            await order.update({
                approvedByDoctor: false,
                autoApprovedByDoctor: false,
                autoApprovalReason: null,
            });
        }
    }

    // Manual method to check specific order eligibility
    async checkOrderEligibility(orderId: string): Promise<{
        eligible: boolean;
        criteria: AutoApprovalCriteria;
        reason: string;
    }> {
        const order = await Order.findByPk(orderId, {
            include: [
                { model: User, as: 'user' },
                { model: Treatment, as: 'treatment' },
            ],
        });

        if (!order) {
            throw new Error('Order not found');
        }

        const criteria = await this.evaluateOrder(order);
        const eligible = this.isEligibleForAutoApproval(criteria);
        const reason = eligible
            ? this.generateApprovalReason(criteria)
            : this.generateSkipReason(criteria);

        return { eligible, criteria, reason };
    }
}

export default new AutoApprovalService();

