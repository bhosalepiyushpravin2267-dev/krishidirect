import { NextResponse } from "next/server";
import { createOffer } from "@/lib/services/offer-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      farmerId,
      cropName,
      quantity,
      unit,
      pricePerUnit,
    } = body;

    if (
      !farmerId ||
      !cropName ||
      !quantity ||
      !unit ||
      !pricePerUnit
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (quantity <= 0 || pricePerUnit <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Quantity and price must be greater than zero",
        },
        { status: 400 }
      );
    }

    const offer = createOffer({
      farmerId,
      cropName,
      quantity,
      unit,
      pricePerUnit,
    });

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