import ShippingAddress from "../models/ShippingAddress";

export interface AddressData {
  addressId?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  label?: string;
  recipientName?: string;
  isDefault?: boolean;
}

export class ShippingAddressService {
  public static async updateOrCreateAddress(
    userId: string,
    addressData: AddressData
  ): Promise<ShippingAddress> {
    const { addressId, ...safeData } = addressData;

    if (addressId) {
      // Update existing address
      const existingAddress = await ShippingAddress.findOne({
        where: { id: addressId, userId },
      });

      if (!existingAddress) {
        throw new Error("Address not found or does not belong to user");
      }

      await existingAddress.update(safeData);
      return existingAddress;
    } else {
      // Create new address
      const newAddress = await ShippingAddress.create({
        userId,
        ...safeData,
        country: safeData.country || "US",
        isDefault: true,
      });

      return newAddress;
    }
  }
}
