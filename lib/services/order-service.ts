import {
  getOfferById,
  updateOffer,
} from "@/lib/repositories/offer-repository";

import {
  getAllOrders,
  getOrderById,
  saveOrder,
  updateOrder,
} from "@/lib/repositories/order-repository";

import type { Order } from "@/types/backend";

export interface CreateOrderInput {
  offerId: string;
  vendorId: string;
  quantity: number;
}

export function createOrder(
  input: CreateOrderInput
):
  | { success: true; order: Order }
  | { success: false; error: string } {

  const offer = getOfferById(input.offerId);

  if (!offer) {
    return {
      success: false,
      error: "Offer not found",
    };
  }

  if (offer.status !== "ACTIVE") {
    return {
      success: false,
      error: "Offer is not active",
    };
  }

  if (input.quantity <= 0) {
    return {
      success: false,
      error: "Quantity must be greater than zero",
    };
  }

  if (input.quantity > offer.quantity) {
    return {
      success: false,
      error: `Only ${offer.quantity} ${offer.unit} available`,
    };
  }

  const now = new Date().toISOString();

  const order: Order = {
    id: `order-${Date.now()}`,
    offerId: offer.id,
    vendorId: input.vendorId,
    quantity: input.quantity,
    totalAmount: input.quantity * offer.pricePerUnit,
    status: "PENDING",
    createdAt: now,
  };

  const remainingQuantity = offer.quantity - input.quantity;

  updateOffer(offer.id, {
    quantity: remainingQuantity,
    status: remainingQuantity === 0 ? "SOLD" : "ACTIVE",
  });

  saveOrder(order);

  return {
    success: true,
    order,
  };
}

export function getOrders(): Order[] {
  return getAllOrders();
}

export function getOrder(id: string): Order | undefined {
  return getOrderById(id);
}

const validTransitions: Record<Order["status"], Order["status"][]> = {
  PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "COMPLETED", "CANCELLED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

export function changeOrderStatus(
  id: string,
  status: Order["status"]
):
  | { success: true; order: Order }
  | { success: false; error: string; code: "NOT_FOUND" | "INVALID_TRANSITION" } {

  const order = getOrderById(id);

  if (!order) {
    return {
      success: false,
      error: "Order not found",
      code: "NOT_FOUND",
    };
  }

  if (!validTransitions[order.status].includes(status)) {
    return {
      success: false,
      error: `Invalid order status transition from ${order.status} to ${status}`,
      code: "INVALID_TRANSITION",
    };
  }

  // If the order is being cancelled for the first time,
  // return the reserved quantity to the original offer.
  if (
    status === "CANCELLED" &&
    order.status !== "CANCELLED"
  ) {
    const offer = getOfferById(order.offerId);

    if (!offer) {
      return {
        success: false,
        error: "Original offer not found",
        code: "NOT_FOUND",
      };
    }

    updateOffer(offer.id, {
      quantity: offer.quantity + order.quantity,
      status: "ACTIVE",
    });
  }

  const updated = updateOrder(id, {
    status,
  });

  if (!updated) {
    return {
      success: false,
      error: "Unable to update order",
      code: "NOT_FOUND",
    };
  }

  return {
    success: true,
    order: updated,
  };
}
