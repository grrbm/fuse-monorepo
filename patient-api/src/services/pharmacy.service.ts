import Order from '../models/Order';
import OrderService from './pharmacy/order';
import { PharmacyProvider } from '../models/Product';
import PharmacyPhysicianService from './pharmacy/physician';



class PharmacyService {

  private orderService: OrderService;
  private pharmacyPhysicianService: PharmacyPhysicianService;

  constructor() {
    this.orderService = new OrderService();
    this.pharmacyPhysicianService = new PharmacyPhysicianService();
  }


  async createPharmacyOrder(order: Order) {

    const provider = order?.treatment?.pharmacyProvider ?? order.tenantProduct?.product.pharmacyProvider;

    console.log(`🏥 Creating pharmacy order for provider: ${provider}, Order: ${order.orderNumber}`);

    switch (provider) {
      case PharmacyProvider.ABSOLUTERX:
        console.log(`📋 Syncing physician to AbsoluteRX...`);
        await this.pharmacyPhysicianService.createPhysician(order)
        console.log(`✅ Physician synced, creating pharmacy order...`);
        return this.orderService.createOrder(order)
      case PharmacyProvider.TRUEPILL:
        break;
      case PharmacyProvider.PILLPACK:
        break;
    }


    return {
      success: true,
      message: "Pharmacy order created successfully"
    };
  }


}

export default PharmacyService;
