import axios, { AxiosResponse } from 'axios';
import { config, PharmacyApiConfig, PharmacyApiResponse } from './config';
import Order from '../../models/Order';
import PatientService from './patient';
import ShippingOrder, { OrderShippingStatus } from '../../models/ShippingOrder';

interface PharmacyProduct {
  sku: number;
  quantity: number;
  refills: number;
  days_supply: number;
  sig: string;
  medical_necessity: string;
}

interface CreateOrderRequest {
  patient_id: number;
  physician_id: number;
  ship_to_clinic: 0 | 1; // 1 = Yes, 0 = No
  service_type: string;
  signature_required: number;
  memo: string;
  external_id?: string;
  test_order: 0 | 1; // 1 for testing
  products: PharmacyProduct[];
}



interface UpdatePatientAddressRequest {
  full: string;
  street: string;
  street_2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

class OrderService {
  private config: PharmacyApiConfig;
  private patientService: PatientService;

  constructor() {
    this.config = config
    this.patientService = new PatientService();
  }

  async postOrder(orderData: CreateOrderRequest): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.baseUrl}/api/clinics/orders`,
        {
          ...orderData,
          clinicId: this.config.clinicId
        },
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
      console.error('Error creating pharmacy order:', error);

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

  async getOrder(orderId: number): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.baseUrl}/api/clinics/orders/${orderId}`,
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
      console.error('Error fetching pharmacy order:', error);

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

  async updatePatientAddress(orderId: number, addressData: UpdatePatientAddressRequest): Promise<PharmacyApiResponse> {
    try {
      const requestData = {
        api_key: this.config.apiKey,
        ...addressData
      };

      const response: AxiosResponse = await axios.put(
        `${this.config.baseUrl}/api/clinics/orders/${orderId}/patient-address`,
        requestData,
        {
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
      console.error('Error updating patient address:', error);

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

  async deleteOrder(orderId: number): Promise<PharmacyApiResponse> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.config.baseUrl}/api/clinics/orders/${orderId}`,
        {
          params: {
            api_key: this.config.apiKey
          },
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Orders can only be deleted (cancelled) as long as they have not been shipped.
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting pharmacy order:', error);

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
  async createOrder(order: Order) {
    console.log(`👤 Syncing patient to AbsoluteRX for order: ${order.orderNumber}`);
    const pharmacyPatientId = await this.patientService.syncPatientFromUser(order.user.id, order.shippingAddressId);
    console.log(`✅ Patient synced, pharmacy patient ID: ${pharmacyPatientId}`);

    // Map order items to pharmacy products
    const products = order.orderItems.map(item => ({
      sku: parseInt(item.pharmacyProductId), // Use pharmacy product ID or default
      quantity: item.quantity,
      refills: 2, // Default refills - could be made configurable
      days_supply: 30, // Default days supply - could be made configurable
      sig: item.dosage || item.product.dosage || "Use as directed",
      medical_necessity: item.notes || "Prescribed treatment as part of patient care plan."
    }));


    const pharmacyPhysicianId = order?.physician?.pharmacyPhysicianId


    if (!pharmacyPhysicianId) {
      return {
        success: false,
        message: "No physician associated with order",
        error: "No physician associated with order",
      };
    }



    // Create pharmacy order
    console.log(`📦 Creating AbsoluteRX order with ${products.length} product(s)...`);
    const pharmacyResult = await this.postOrder({
      patient_id: parseInt(pharmacyPatientId),
      physician_id: parseInt(pharmacyPhysicianId),
      ship_to_clinic: 0, // Ship to patient
      service_type: "two_day",
      signature_required: 1,
      memo: order.notes || "Order approved",
      external_id: order.id,
      test_order: process.env.NODE_ENV === 'production' ? 0 : 1,
      products: products
    });

    if (!pharmacyResult.success) {
      console.error(`❌ Failed to create AbsoluteRX order: ${pharmacyResult.error}`);
      return {
        success: false,
        message: "Failed to create pharmacy order",
        error: pharmacyResult.error || "Unknown pharmacy error"
      };
    }

    const pharmacyOrderId = pharmacyResult.data?.data?.number?.toString();
    console.log(`✅ AbsoluteRX order created successfully! Pharmacy Order #: ${pharmacyOrderId}`);

    // Create shipping order with proper address reference
    console.log(`📋 Creating ShippingOrder record in database...`);
    await ShippingOrder.create({
      orderId: order.id,
      shippingAddressId: order.shippingAddressId,
      status: OrderShippingStatus.PROCESSING,
      pharmacyOrderId: pharmacyOrderId
    });
    console.log(`✅ ShippingOrder created successfully!`);
  }
}

export default OrderService;
export type { CreateOrderRequest, PharmacyProduct, UpdatePatientAddressRequest };