import { NextResponse } from "next/server";
import { getAllOffers } from "@/lib/repositories/offer-repository";

export async function GET() {
  try {
    const offers = getAllOffers();

    return NextResponse.json({
      success: true,
      data: offers,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Unable to fetch marketplace offers",
      },
      { status: 500 }
    );
  }
}