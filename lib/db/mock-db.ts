import type {
    Offer,
    Order,
    Payment,
} from "@/types/backend";

import type {
    MarketplaceOffer,
} from "@/lib/marketplaceOffers";

/* -------------------------------------------------------
   MOCK MARKETPLACE OFFERS
------------------------------------------------------- */

export const offers: Offer[] = [
    {
        id: "offer-001",
        farmerId: "farmer-001",
        cropName: "Tomato",
        quantity: 500,
        unit: "kg",
        pricePerUnit: 28,
        harvestDate:
            "2026-08-16T10:30:15.914Z",
        freshnessScore: 92,
        status: "ACTIVE",
        createdAt:
            "2026-08-16T10:30:15.914Z",
    },

    {
        id: "offer-002",
        farmerId: "farmer-001",
        cropName: "Onion",
        quantity: 400,
        unit: "kg",
        pricePerUnit: 27,
        harvestDate:
            "2026-08-16T10:30:15.914Z",
        freshnessScore: 88,
        status: "ACTIVE",
        createdAt:
            "2026-08-16T10:30:15.914Z",
    },
];

/* -------------------------------------------------------
   MOCK ORDERS
------------------------------------------------------- */

export const orders: Order[] = [];

/* -------------------------------------------------------
   MOCK PAYMENTS
------------------------------------------------------- */

export const payments: Payment[] = [];

/* -------------------------------------------------------
   MARKETPLACE OFFERS
-------------------------------------------------------

   These are offers created when a customer uses
   "Make an Offer" from the marketplace.

   The API route uses this server-side store so that
   the farmer can receive offers without depending
   on the customer's browser localStorage.
------------------------------------------------------- */

export const marketplaceOffers: MarketplaceOffer[] = [];
