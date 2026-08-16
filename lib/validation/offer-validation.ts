export interface OfferValidationInput {
  farmerId: unknown;
  cropName: unknown;
  quantity: unknown;
  unit: unknown;
  pricePerUnit: unknown;
}

export function validateCreateOffer(
  input: OfferValidationInput
) {
  if (
    typeof input.farmerId !== "string" ||
    !input.farmerId.trim()
  ) {
    return {
      valid: false,
      error: "farmerId is required",
    };
  }

  if (
    typeof input.cropName !== "string" ||
    !input.cropName.trim()
  ) {
    return {
      valid: false,
      error: "cropName is required",
    };
  }

  if (
    typeof input.quantity !== "number" ||
    input.quantity <= 0
  ) {
    return {
      valid: false,
      error: "quantity must be greater than zero",
    };
  }

  if (
    typeof input.unit !== "string" ||
    !input.unit.trim()
  ) {
    return {
      valid: false,
      error: "unit is required",
    };
  }

  if (
    typeof input.pricePerUnit !== "number" ||
    input.pricePerUnit <= 0
  ) {
    return {
      valid: false,
      error: "pricePerUnit must be greater than zero",
    };
  }

  return {
    valid: true,
    error: null,
  };
}