import { getOrderById } from "@/lib/repositories/order-repository";

import {
  getAllPayments,
  getPaymentById,
  getPaymentByOrderId,
  savePayment,
  updatePayment,
} from "@/lib/repositories/payment-repository";

import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/types/backend";

export interface CreatePaymentInput {
  orderId: string;
  method: PaymentMethod;
}

/* -------------------------------------------------------
   CREATE PAYMENT
------------------------------------------------------- */

export async function createPayment(
  input: CreatePaymentInput
):
  Promise<
    | {
        success: true;
        payment: Payment;
      }
    | {
        success: false;
        error: string;
      }
  > {
  /*
   * IMPORTANT:
   * await works whether getOrderById() returns:
   *
   * Order | undefined
   *
   * or:
   *
   * Promise<Order | undefined>
   *
   * This makes the service compatible with both versions
   * of the order repository.
   */
  const order =
    await getOrderById(input.orderId);

  if (!order) {
    return {
      success: false,
      error: "Order not found",
    };
  }

  if (
    order.status === "CANCELLED"
  ) {
    return {
      success: false,
      error:
        "Cannot create payment for a cancelled order",
    };
  }

  if (
    order.status === "COMPLETED"
  ) {
    return {
      success: false,
      error:
        "Order is already completed",
    };
  }

  const existingPayment =
    getPaymentByOrderId(order.id);

  if (existingPayment) {
    return {
      success: false,
      error:
        "Payment already exists for this order",
    };
  }

  const now =
    new Date().toISOString();

  const payment: Payment = {
    id:
      `payment-${Date.now()}`,

    orderId:
      order.id,

    amount:
      order.totalAmount,

    method:
      input.method,

    status:
      "PENDING",

    createdAt:
      now,

    updatedAt:
      now,
  };

  savePayment(payment);

  return {
    success: true,
    payment,
  };
}

/* -------------------------------------------------------
   GET ALL PAYMENTS
------------------------------------------------------- */

export function getPayments(): Payment[] {
  return getAllPayments();
}

/* -------------------------------------------------------
   GET PAYMENT BY ID
------------------------------------------------------- */

export function getPayment(
  id: string
): Payment | undefined {
  return getPaymentById(id);
}

/* -------------------------------------------------------
   VALID PAYMENT STATUS TRANSITIONS
------------------------------------------------------- */

const validTransitions:
  Record<
    PaymentStatus,
    PaymentStatus[]
  > = {
    PENDING: [
      "PENDING",
      "PROCESSING",
      "FAILED",
    ],

    PROCESSING: [
      "PROCESSING",
      "PAID",
      "FAILED",
    ],

    PAID: [
      "PAID",
      "REFUNDED",
    ],

    FAILED: [
      "FAILED",
      "PENDING",
      "PROCESSING",
    ],

    REFUNDED: [
      "REFUNDED",
    ],
  };

/* -------------------------------------------------------
   CHANGE PAYMENT STATUS
------------------------------------------------------- */

export function changePaymentStatus(
  id: string,
  status: PaymentStatus,
  transactionId?: string
):
  | {
      success: true;
      payment: Payment;
    }
  | {
      success: false;
      error: string;
      code:
        | "NOT_FOUND"
        | "INVALID_TRANSITION";
    } {
  const payment =
    getPaymentById(id);

  if (!payment) {
    return {
      success: false,
      error: "Payment not found",
      code: "NOT_FOUND",
    };
  }

  if (
    !validTransitions[
      payment.status
    ].includes(status)
  ) {
    return {
      success: false,
      error:
        `Invalid payment status transition ` +
        `from ${payment.status} to ${status}`,

      code:
        "INVALID_TRANSITION",
    };
  }

  const updated =
    updatePayment(id, {
      status,

      transactionId:
        transactionId ??
        payment.transactionId,

      updatedAt:
        new Date().toISOString(),
    });

  if (!updated) {
    return {
      success: false,
      error:
        "Unable to update payment",

      code:
        "NOT_FOUND",
    };
  }

  return {
    success: true,
    payment: updated,
  };
}
