import { NextResponse } from "next/server";
import {
  createOrder,
  getOrders,
} from "@/lib/services/order-service";
import { validateCreateOrder } from "@/lib/validation/order-validation";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: getOrders(),
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Unable to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateCreateOrder(body);

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

    const result = createOrder({
      offerId: body.offerId,
      vendorId: body.vendorId,
      quantity: body.quantity,
    });

    if (!result.success) {
      const status =
        result.error === "Offer not found" ? 404 :
        result.error === "Offer is not active" ? 409 :
        400;

      return NextResponse.json(
        {
          success: false,
          data: null,
          error: result.error,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.order,
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
