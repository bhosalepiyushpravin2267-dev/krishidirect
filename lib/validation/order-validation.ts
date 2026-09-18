export interface CreateOrderValidationInput {
  offerId: unknown;
  customerId?: unknown;
  vendorId?: unknown;
  quantity: unknown;
}

export function validateCreateOrder(
  input: CreateOrderValidationInput
):
  | { valid: true; error: null; customerId: string }
  | { valid: false; error: string; customerId?: undefined } {
  if (
    typeof input.offerId !== "string" ||
    !input.offerId.trim()
  ) {
    return {
      valid: false,
      error: "offerId is required",
    };
  }

  const customerId =
    (typeof input.customerId === "string" && input.customerId.trim()) ||
    (typeof input.vendorId === "string" && input.vendorId.trim()) ||
    "";

  if (!customerId) {
    return {
      valid: false,
      error: "customerId is required",
    };
  }

  if (
    typeof input.quantity !== "number" ||
    !Number.isFinite(input.quantity) ||
    input.quantity <= 0
  ) {
    return {
      valid: false,
      error: "quantity must be greater than zero",
    };
  }

  return {
    valid: true,
    error: null,
    customerId,
  };
}
