import { offers } from "@/lib/db/mock-db";
import type { Offer } from "@/types/backend";

export function getAllOffers(): Offer[] {
  return offers;
}

export function getOfferById(id: string): Offer | undefined {
  return offers.find((offer) => offer.id === id);
}

export function saveOffer(offer: Offer): Offer {
  offers.push(offer);
  return offer;
}

export function updateOffer(
  id: string,
  updates: Partial<Offer>
): Offer | undefined {
  const index = offers.findIndex((offer) => offer.id === id);

  if (index === -1) {
    return undefined;
  }

  offers[index] = {
    ...offers[index],
    ...updates,
  };

  return offers[index];
}

export function deleteOffer(id: string): boolean {
  const index = offers.findIndex((offer) => offer.id === id);

  if (index === -1) {
    return false;
  }

  offers.splice(index, 1);

  return true;
}
