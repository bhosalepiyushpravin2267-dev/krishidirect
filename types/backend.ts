export type UserRole = "FARMER" | "VENDOR" | "ADMIN";

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
  vendorId: string;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}