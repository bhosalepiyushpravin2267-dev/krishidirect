import { NextResponse } from "next/server";
import {
  getOrder,
  changeOrderStatus,
} from "@/lib/services/order-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const order = getOrder(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Unable to fetch order",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (
      typeof body.status !== "string" ||
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "status must be PENDING, CONFIRMED, COMPLETED, or CANCELLED",
        },
        { status: 400 }
      );
    }

    const result = changeOrderStatus(
      id,
      body.status
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: result.error,
        },
        {
          status:
            result.code === "NOT_FOUND"
              ? 404
              : 409,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.order,
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
