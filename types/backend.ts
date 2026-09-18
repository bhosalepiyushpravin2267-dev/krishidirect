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

export interface Order {
  id: string;
  offerId: string;
  customerId: string;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export type PaymentMethod = "UPI" | "CARD" | "COD";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}