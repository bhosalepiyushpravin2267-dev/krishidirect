import { NextResponse } from "next/server";
import type { MarketplaceOffer } from "@/lib/marketplaceOffers";

/*
 * Shared in-memory store for the marketplace offers API.
 * Both the customer POST and farmer GET use this same server-side store.
 */
const globalStore = globalThis as typeof globalThis & {
    __krishiDirectMarketplaceOffers?: MarketplaceOffer[];
};

const marketplaceOffers =
    globalStore.__krishiDirectMarketplaceOffers ??
    (globalStore.__krishiDirectMarketplaceOffers = []);

export async function GET() {
    return NextResponse.json({
        success: true,
        data: marketplaceOffers,
        error: null,
    });
}

export async function POST(request: Request) {
    try {
        const offer =
            (await request.json()) as MarketplaceOffer;

        if (
            !offer ||
            typeof offer.id !== "string" ||
            typeof offer.farmerId !== "string" ||
            typeof offer.customerName !== "string" ||
            typeof offer.listingId !== "string"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    error: "Invalid marketplace offer",
                },
                { status: 400 }
            );
        }

        /* Prevent duplicate offers when the request is retried. */
        const existingIndex =
            marketplaceOffers.findIndex(
                (item) => item.id === offer.id
            );

        if (existingIndex !== -1) {
            marketplaceOffers[existingIndex] = {
                ...marketplaceOffers[existingIndex],
                ...offer,
            };

            return NextResponse.json({
                success: true,
                data: marketplaceOffers[existingIndex],
                error: null,
            });
        }

        marketplaceOffers.push(offer);

        return NextResponse.json(
            {
                success: true,
                data: offer,
                error: null,
            },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            {
                success: false,
                data: null,
                error: "Invalid request body",
            },
            { status: 400 }
        );
    }
}


export async function PATCH(request: Request) {
    try {
        const body = (await request.json()) as {
            id?: string;
            updates?: Partial<MarketplaceOffer>;
        };

        if (
            typeof body.id !== "string" ||
            !body.id.trim() ||
            !body.updates ||
            typeof body.updates !== "object"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    error: "Invalid marketplace offer update",
                },
                { status: 400 }
            );
        }

        const index = marketplaceOffers.findIndex(
            (item) => item.id === body.id
        );

        if (index === -1) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    error: "Offer not found",
                },
                { status: 404 }
            );
        }

        marketplaceOffers[index] = {
            ...marketplaceOffers[index],
            ...body.updates,
        };

        return NextResponse.json({
            success: true,
            data: marketplaceOffers[index],
            error: null,
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                data: null,
                error: "Invalid request body",
            },
            { status: 400 }
        );
    }
}
