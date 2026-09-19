// lib/marketplaceOffers.ts

export type OfferStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled";

export type DealStage =
    | "offer-received"
    | "offer-accepted"
    | "pickup-arranged"
    | "completed";

export type PaymentMethod =
    | "UPI"
    | "CARD"
    | "BANK_TRANSFER"
    | "PAY_ON_PICKUP";

export type PaymentStatus =
    | "PENDING"
    | "PROCESSING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

export interface MarketplaceOffer {
    id: string;

    listingId: string;

    customerName: string;
    customerPhone: string;

    farmerId: string;
    farmerName: string;

    crop: string;

    quantity: number;
    unit: "kg" | "quintal";

    offeredPricePerUnit: number;
    originalPricePerUnit: number;

    status: OfferStatus;

    dealStage: DealStage;

    /**
     * Optional backend order/payment references.
     * These are used when the marketplace offer
     * is connected to the order/payment system.
     */
    orderId?: string;
    paymentId?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    transactionId?: string;

    createdAt: string;
}

const STORAGE_KEY =
    "krishidirect-marketplace-offers";

/* -------------------------------------------------------
   GET ALL OFFERS
------------------------------------------------------- */

export function getOffers(): MarketplaceOffer[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const stored =
            localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return [];
        }

        return JSON.parse(
            stored
        ) as MarketplaceOffer[];
    } catch {
        return [];
    }
}

/* -------------------------------------------------------
   SYNC WITH SERVER
------------------------------------------------------- */

export async function refreshOffersFromServer(): Promise<MarketplaceOffer[]> {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const response = await fetch("/api/marketplace-offers", {
            method: "GET",
            cache: "no-store",
        });

        if (!response.ok) {
            return getOffers();
        }

        const payload = (await response.json()) as {
            success?: boolean;
            data?: MarketplaceOffer[];
        };

        if (!payload.success || !Array.isArray(payload.data)) {
            return getOffers();
        }

        // Merge local and server copies by id. Server values win when the
        // same offer was updated from another browser/device.
        const merged = new Map<string, MarketplaceOffer>();

        for (const offer of getOffers()) {
            merged.set(offer.id, offer);
        }

        for (const offer of payload.data) {
            merged.set(offer.id, offer);
        }

        const result = Array.from(merged.values());

        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        window.dispatchEvent(new Event("krishidirect-offers-updated"));

        return result;
    } catch {
        return getOffers();
    }
}

/* -------------------------------------------------------
   SAVE NEW OFFER
------------------------------------------------------- */

export function saveOffer(
    offer: MarketplaceOffer
): void {
    if (typeof window === "undefined") {
        return;
    }

    const offers = getOffers();

    /*
     * Prevent the same offer from being stored twice.
     */
    const existingIndex =
        offers.findIndex(
            (existingOffer) =>
                existingOffer.id === offer.id
        );

    if (existingIndex !== -1) {
        offers[existingIndex] = {
            ...offers[existingIndex],
            ...offer,
        };
    } else {
        offers.push(offer);
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(offers)
    );

    window.dispatchEvent(
        new Event(
            "krishidirect-offers-updated"
        )
    );

    // Persist the same offer to the server so the farmer can see it even
    // when the customer and farmer are using different browsers/devices.
    void fetch("/api/marketplace-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
    }).catch(() => {
        // localStorage remains the fallback for the demo.
    });
}

/* -------------------------------------------------------
   UPDATE OFFER
------------------------------------------------------- */

export function updateOffer(
    id: string,
    updates: Partial<MarketplaceOffer>
): void {
    if (typeof window === "undefined") {
        return;
    }

    const offers = getOffers();

    const updatedOffers =
        offers.map((offer) =>
            offer.id === id
                ? {
                    ...offer,
                    ...updates,
                }
                : offer
        );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedOffers)
    );

    window.dispatchEvent(
        new Event(
            "krishidirect-offers-updated"
        )
    );

    // Mirror status/deal/payment changes to the server so both sides of the
    // marketplace see the same offer state.
    void fetch("/api/marketplace-offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
            updates,
        }),
    }).catch(() => {
        // localStorage remains the fallback for the demo.
    });
}


/* -------------------------------------------------------
   CANCEL OFFER
------------------------------------------------------- */

export function cancelOffer(
    id: string
): void {
    updateOffer(id, {
        status: "cancelled",
    });
}


/* -------------------------------------------------------
   DELETE OFFER
------------------------------------------------------- */

export function deleteOffer(
    id: string
): void {
    if (typeof window === "undefined") {
        return;
    }

    const offers = getOffers();

    const updatedOffers =
        offers.filter(
            (offer) =>
                offer.id !== id
        );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedOffers)
    );

    window.dispatchEvent(
        new Event(
            "krishidirect-offers-updated"
        )
    );
}

/* -------------------------------------------------------
   CLEAR ALL OFFERS
------------------------------------------------------- */

export function clearOffers(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    window.dispatchEvent(
        new Event(
            "krishidirect-offers-updated"
        )
    );
}
