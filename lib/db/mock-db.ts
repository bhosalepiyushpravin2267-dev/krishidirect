import type { Offer, Order } from "@/types/backend";

export const offers: Offer[] = [
  {
    id: "offer-001",
    farmerId: "farmer-001",
    cropName: "Tomato",
    quantity: 500,
    unit: "kg",
    pricePerUnit: 28,
    harvestDate: "2026-08-16T10:30:15.914Z",
    freshnessScore: 92,
    status: "ACTIVE",
    createdAt: "2026-08-16T10:30:15.914Z",
  },
  {
    id: "offer-002",
    farmerId: "farmer-001",
    cropName: "Onion",
    quantity: 400,
    unit: "kg",
    pricePerUnit: 27,
    harvestDate: "2026-08-16T10:30:15.914Z",
    freshnessScore: 88,
    status: "ACTIVE",
    createdAt: "2026-08-16T10:30:15.914Z",
  },
];

export const orders: Order[] = [];
