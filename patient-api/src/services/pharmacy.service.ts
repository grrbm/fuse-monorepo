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

    const provider = order.treatment.pharmacyProvider;


    switch (provider) {
      case PharmacyProvider.ABSOLUTERX:
        await this.pharmacyPhysicianService.createPhysician(order)
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
