import { NextResponse } from "next/server";
import { createOffer } from "@/lib/services/offer-service";
import { validateCreateOffer } from "@/lib/validation/offer-validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateCreateOffer(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const offer = createOffer({
      farmerId: body.farmerId,
      cropName: body.cropName,
      quantity: body.quantity,
      unit: body.unit,
      pricePerUnit: body.pricePerUnit,
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
        error: "Invalid JSON request body",
      },
      { status: 400 }
    );
  }
}