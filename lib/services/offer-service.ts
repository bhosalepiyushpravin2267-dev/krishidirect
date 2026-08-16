import {
  getOfferById,
  saveOffer,
  updateOffer as updateOfferRepository,
  deleteOffer as deleteOfferRepository,
} from "@/lib/repositories/offer-repository";
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

  return saveOffer(newOffer);
}

export function getOffer(id: string): Offer | undefined {
  return getOfferById(id);
}
export function updateOffer(
  id: string,
  updates: Partial<Offer>
): Offer | undefined {
  return updateOfferRepository(id, updates);
}

export function deleteOffer(id: string): boolean {
  return deleteOfferRepository(id);
}