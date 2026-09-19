import { NextResponse } from "next/server";
import { marketplaceOffers } from "@/lib/db/mock-db";
import type { MarketplaceOffer } from "@/lib/marketplaceOffers";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: marketplaceOffers,
    error: null,
  });
}

export async function POST(request: Request) {
  try {
    const offer = (await request.json()) as MarketplaceOffer;

    if (
      !offer ||
      typeof offer.id !== "string" ||
      typeof offer.farmerId !== "string" ||
      typeof offer.orderId !== "string"
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

    // Prevent duplicate offers if the request is retried.
    const existingIndex = marketplaceOffers.findIndex(
      (item) => item.id === offer.id
    );

    if (existingIndex >= 0) {
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
        error: "Invalid JSON request body",
      },
      { status: 400 }
    );
  }
}
