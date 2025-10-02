import ShippingOrder, { OrderShippingStatus } from '../../models/ShippingOrder';

interface PharmacyWebhookEvent {
  event_type: string;
  erx_number: number;
  erx_id: number;
  metadata: string;
}

class PharmacyWebhookService {

  /**
   * Handle order_filled event from pharmacy
   */
  async handleOrderFilled(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('💊 Pharmacy order filled:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.FILLED
      });

      console.log('✅ ShippingOrder updated to filled status');

    } catch (error) {
      console.error('❌ Error processing order filled:', error);
      throw error;
    }
  }

  /**
   * Handle order_approved event from pharmacy
   */
  async handleOrderApproved(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('✅ Pharmacy order approved:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.APPROVED
      });

      console.log('✅ ShippingOrder updated to approved status');

    } catch (error) {
      console.error('❌ Error processing order approved:', error);
      throw error;
    }
  }

  /**
   * Handle order_shipped event from pharmacy
   */
  async handleOrderShipped(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('📦 Pharmacy order shipped:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.SHIPPED
      });

      console.log('✅ ShippingOrder updated to shipped status');

    } catch (error) {
      console.error('❌ Error processing order shipped:', error);
      throw error;
    }
  }

  /**
   * Handle order_problem event from pharmacy
   */
  async handleOrderProblem(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('⚠️ Pharmacy order problem:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.PROBLEM
      });

      console.log('⚠️ ShippingOrder updated to problem status');

    } catch (error) {
      console.error('❌ Error processing order problem:', error);
      throw error;
    }
  }

  /**
   * Handle order_rejected event from pharmacy
   */
  async handleOrderRejected(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('❌ Pharmacy order rejected:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.REJECTED
      });

      console.log('❌ ShippingOrder updated to rejected status');

    } catch (error) {
      console.error('❌ Error processing order rejected:', error);
      throw error;
    }
  }

  /**
   * Handle order_received_tracking event from pharmacy
   */
  async handleOrderReceivedTracking(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('📍 Pharmacy order tracking received:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      // Keep current status, just log tracking received
      console.log('📍 Tracking information received for ShippingOrder');

    } catch (error) {
      console.error('❌ Error processing order tracking:', error);
      throw error;
    }
  }

  /**
   * Handle order_processed event from pharmacy
   */
  async handleOrderProcessed(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('⚙️ Pharmacy order processed:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.PROCESSING
      });

      console.log('⚙️ ShippingOrder updated to processing status');

    } catch (error) {
      console.error('❌ Error processing order processed:', error);
      throw error;
    }
  }

  /**
   * Handle order_completed event from pharmacy
   */
  async handleOrderCompleted(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('🎉 Pharmacy order completed:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.COMPLETED,
        deliveredAt: new Date()
      });

      console.log('🎉 ShippingOrder updated to completed status');

    } catch (error) {
      console.error('❌ Error processing order completed:', error);
      throw error;
    }
  }

  /**
   * Handle order_created event from pharmacy
   */
  async handleOrderCreated(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('📦 Pharmacy order created:', eventData.erx_number);

    try {
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      await shippingOrder.update({
        status: OrderShippingStatus.PENDING
      });

      console.log('📦 ShippingOrder updated to pending status');

    } catch (error) {
      console.error('❌ Error processing order created:', error);
      throw error;
    }
  }
  /**
   * Handle order_cancelled event from pharmacy
   */
  async handleOrderCancelled(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('❌ Pharmacy order cancelled:', eventData.erx_number);

    try {
      // Find ShippingOrder by pharmacyOrderId
      const shippingOrder = await ShippingOrder.findOne({
        where: { pharmacyOrderId: eventData.erx_number.toString() },
      });

      if (!shippingOrder) {
        console.log('⚠️ ShippingOrder not found for pharmacyOrderId:', eventData.erx_number);
        return;
      }

      // Update ShippingOrder status to cancelled
      await shippingOrder.update({
        status: OrderShippingStatus.CANCELLED
      });


    } catch (error) {
      console.error('❌ Error processing order cancelled:', error);
      throw error;
    }
  }

  /**
   * Process pharmacy webhook events
   */
  async processPharmacyWebhook(eventData: PharmacyWebhookEvent): Promise<void> {
    console.log('📫 Processing pharmacy webhook:', eventData.event_type, 'for eRx:', eventData.erx_number);

    switch (eventData.event_type) {
      case 'order_filled':
        await this.handleOrderFilled(eventData);
        break;

      case 'order_approved':
        await this.handleOrderApproved(eventData);
        break;

      case 'order_shipped':
        await this.handleOrderShipped(eventData);
        break;

      case 'order_problem':
        await this.handleOrderProblem(eventData);
        break;

      case 'order_rejected':
        await this.handleOrderRejected(eventData);
        break;

      case 'order_received_tracking':
        await this.handleOrderReceivedTracking(eventData);
        break;

      case 'order_processed':
        await this.handleOrderProcessed(eventData);
        break;

      case 'order_completed':
        await this.handleOrderCompleted(eventData);
        break;

      case 'order_cancelled':
        await this.handleOrderCancelled(eventData);
        break;

      default:
        console.log(`🔍 Unhandled pharmacy webhook event type: ${eventData.event_type}`);
    }
  }
}

export default new PharmacyWebhookService();
export type { PharmacyWebhookEvent };