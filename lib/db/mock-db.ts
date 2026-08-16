import type { Farmer, Offer, Order } from "@/types/backend";

export const farmers: Farmer[] = [
  {
    id: "farmer-001",
    name: "Demo Farmer",
    phone: "9999999999",
    village: "Demo Village",
    district: "Pune",
    state: "Maharashtra",
    role: "FARMER",
  },
];

export const offers: Offer[] = [
  {
    id: "offer-001",
    farmerId: "farmer-001",
    cropName: "Tomato",
    quantity: 500,
    unit: "kg",
    pricePerUnit: 28,
    harvestDate: new Date().toISOString(),
    freshnessScore: 92,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "offer-002",
    farmerId: "farmer-001",
    cropName: "Onion",
    quantity: 300,
    unit: "kg",
    pricePerUnit: 25,
    harvestDate: new Date().toISOString(),
    freshnessScore: 88,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
];

export const orders: Order[] = [];