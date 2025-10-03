import Order from '../models/Order';
import OrderService from './pharmacy/order';
import { PharmacyProvider } from '../models/Product';



class PharmacyService {

  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }


  async createPharmacyOrder(order: Order) {

    const provider = order.treatment.pharmacyProvider;


    switch (provider) {
      case PharmacyProvider.ABSOLUTERX:
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
