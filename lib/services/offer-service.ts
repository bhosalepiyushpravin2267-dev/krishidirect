import { offers } from "@/lib/db/mock-db";
import type { Offer } from "@/types/backend";

export interface CreateOfferInput {
  farmerId: string;
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export function createOffer(input: CreateOfferInput): Offer {
  const now = new Date().toISOString();

  const newOffer: Offer = {
    id: `offer-${Date.now()}`,
    farmerId: input.farmerId,
    cropName: input.cropName,
    quantity: input.quantity,
    unit: input.unit,
    pricePerUnit: input.pricePerUnit,
    harvestDate: now,
    freshnessScore: 0,
    status: "ACTIVE",
    createdAt: now,
  };

  offers.push(newOffer);

  return newOffer;
}