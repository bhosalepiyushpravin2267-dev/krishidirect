export type UserRole = "FARMER" | "CUSTOMER" | "ADMIN";

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  role: "FARMER";
}

export interface Offer {
  id: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: string;
  freshnessScore: number;
  status: "ACTIVE" | "SOLD" | "EXPIRED";
  createdAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type DeliverySpeed = "STANDARD" | "EXPRESS";

export interface Order {
  id: string;
  offerId: string;
  customerId: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: string;
  pincode?: string;
  preferredDeliverySlot?: string;
  deliverySpeed?: DeliverySpeed;
  deliveryStatus?:
    | "ORDER_PLACED"
    | "PACKED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED";
}