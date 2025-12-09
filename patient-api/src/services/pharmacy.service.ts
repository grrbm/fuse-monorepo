import Order from "../models/Order";
import OrderService from "./pharmacy/order";
import { PharmacyProvider } from "../models/Product";
import PharmacyPhysicianService from "./pharmacy/physician";
import PharmacyProduct from "../models/PharmacyProduct";
import IronSailOrderService from "./pharmacy/ironsail-order";

class PharmacyService {
  private orderService: OrderService;
  private pharmacyPhysicianService: PharmacyPhysicianService;
  private ironSailOrderService: IronSailOrderService;

  constructor() {
    this.orderService = new OrderService();
    this.pharmacyPhysicianService = new PharmacyPhysicianService();
    this.ironSailOrderService = new IronSailOrderService();
  }

  async createPharmacyOrder(
    order: Order,
    pharmacySlug?: string,
    coverage?: PharmacyProduct
  ) {
    // If pharmacy slug is provided from coverage, use it; otherwise fall back to legacy logic
    if (pharmacySlug) {
      if (process.env.NODE_ENV === "development") {
        console.log(`🏥 Creating pharmacy order using coverage`);
      }

      switch (pharmacySlug) {
        case "absoluterx":
          if (process.env.NODE_ENV === "development") {
            console.log("📋 Syncing physician to AbsoluteRX...");
          }

          await this.pharmacyPhysicianService.createPhysician(order);
          if (process.env.NODE_ENV === "development") {
            console.log("📋 Processing IronSail order...");
          }

          return this.orderService.createOrder(order);

        case "ironsail":
          if (process.env.NODE_ENV === "development") {
            console.log("📋 Processing IronSail order...");
          }

          return this.ironSailOrderService.createOrder(order, coverage);

        default:
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ Unknown pharmacy slug");
          }

          return {
            success: false,
            message: `Unsupported pharmacy: ${pharmacySlug}`,
          };
      }
    }

    // Legacy fallback for old orders without pharmacy coverage
    const provider =
      order?.treatment?.pharmacyProvider ??
      order.tenantProduct?.product.pharmacyProvider;

    if (process.env.NODE_ENV === "development") {
      console.log("🏥 Creating pharmacy order for legacy provider");
    }

    switch (provider) {
      case PharmacyProvider.ABSOLUTERX:
        console.log(`📋 Syncing physician to AbsoluteRX...`);
        await this.pharmacyPhysicianService.createPhysician(order);
        console.log(`✅ Physician synced, creating pharmacy order...`);
        return this.orderService.createOrder(order);
      case PharmacyProvider.TRUEPILL:
        break;
      case PharmacyProvider.PILLPACK:
        break;
    }

    return {
      success: true,
      message: "Pharmacy order created successfully",
    };
  }
}

export default PharmacyService;
