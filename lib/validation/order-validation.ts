export interface CreateOrderValidationInput {
  offerId: unknown;
  vendorId: unknown;
  quantity: unknown;
}

export function validateCreateOrder(
  input: CreateOrderValidationInput
) {
  if (
    typeof input.offerId !== "string" ||
    !input.offerId.trim()
  ) {
    return {
      valid: false,
      error: "offerId is required",
    };
  }

  if (
    typeof input.vendorId !== "string" ||
    !input.vendorId.trim()
  ) {
    return {
      valid: false,
      error: "vendorId is required",
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
  };
}
