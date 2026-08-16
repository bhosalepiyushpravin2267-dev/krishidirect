import { NextResponse } from "next/server";
import {
  getOffer,
  updateOffer,
  deleteOffer,
} from "@/lib/services/offer-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const offer = getOffer(id);

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Offer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: offer,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Unable to fetch offer",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existingOffer = getOffer(id);

    if (!existingOffer) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Offer not found",
        },
        { status: 404 }
      );
    }

    const updatedOffer = updateOffer(id, {
      cropName: body.cropName ?? existingOffer.cropName,
      quantity: body.quantity ?? existingOffer.quantity,
      unit: body.unit ?? existingOffer.unit,
      pricePerUnit:
        body.pricePerUnit ?? existingOffer.pricePerUnit,
      status: body.status ?? existingOffer.status,
    });

    return NextResponse.json({
      success: true,
      data: updatedOffer,
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const deleted = deleteOffer(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Offer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        message: "Offer deleted successfully",
      },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Unable to delete offer",
      },
      { status: 500 }
    );
  }
}