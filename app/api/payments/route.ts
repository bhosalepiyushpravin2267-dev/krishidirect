import { NextResponse } from "next/server";

import {
  createPayment,
  getPayment,
  getPayments,
  changePaymentStatus,
} from "@/lib/services/payment-service";

import type {
  PaymentMethod,
  PaymentStatus,
} from "@/types/backend";

/* -------------------------------------------------------
   GET
------------------------------------------------------- */

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (id) {
      const payment =
        getPayment(id);

      if (!payment) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Payment not found",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: payment,
      });
    }

    return NextResponse.json({
      success: true,
      data: getPayments(),
    });
  } catch (error) {
    console.error(
      "GET /api/payments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch payments",
      },
      {
        status: 500,
      }
    );
  }
}

/* -------------------------------------------------------
   POST
------------------------------------------------------- */

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        orderId?: string;
        method?: PaymentMethod;
      };

    if (
      !body.orderId ||
      !body.method
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "orderId and method are required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * createPayment() is asynchronous because
     * getOrderById() may return a Promise.
     */
    const result =
      await createPayment({
        orderId:
          body.orderId,

        method:
          body.method,
      });

    if (!result.success) {
      return NextResponse.json(
        result,
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      result,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/payments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create payment",
      },
      {
        status: 500,
      }
    );
  }
}

/* -------------------------------------------------------
   PATCH
------------------------------------------------------- */

export async function PATCH(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        id?: string;
        status?: PaymentStatus;
        transactionId?: string;
      };

    if (
      !body.id ||
      !body.status
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "id and status are required",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      changePaymentStatus(
        body.id,
        body.status,
        body.transactionId
      );

    if (!result.success) {
      return NextResponse.json(
        result,
        {
          status:
            result.code ===
            "NOT_FOUND"
              ? 404
              : 400,
        }
      );
    }

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "PATCH /api/payments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update payment",
      },
      {
        status: 500,
      }
    );
  }
}
