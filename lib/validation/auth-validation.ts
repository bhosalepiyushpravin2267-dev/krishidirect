export type AuthRole = "FARMER" | "VENDOR";

export interface SendOtpInput {
  role: unknown;
  identifier: unknown;
}

export interface VerifyOtpInput {
  role: unknown;
  identifier: unknown;
  otp: unknown;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function validateSendOtp(
  input: SendOtpInput
): {
  valid: boolean;
  error: string | null;
} {
  if (
    input.role !== "FARMER" &&
    input.role !== "VENDOR"
  ) {
    return {
      valid: false,
      error: "role must be FARMER or VENDOR",
    };
  }

  if (
    typeof input.identifier !== "string" ||
    !input.identifier.trim()
  ) {
    return {
      valid: false,
      error: "Email or mobile number is required",
    };
  }

  const identifier = input.identifier.trim();

  if (
    !isValidEmail(identifier) &&
    !isValidPhone(identifier)
  ) {
    return {
      valid: false,
      error: "Enter a valid email or 10-digit mobile number",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

export function validateVerifyOtp(
  input: VerifyOtpInput
): {
  valid: boolean;
  error: string | null;
} {
  const sendValidation = validateSendOtp({
    role: input.role,
    identifier: input.identifier,
  });

  if (!sendValidation.valid) {
    return sendValidation;
  }

  if (
    typeof input.otp !== "string" ||
    !/^\d{6}$/.test(input.otp)
  ) {
    return {
      valid: false,
      error: "OTP must be a 6-digit number",
    };
  }

  return {
    valid: true,
    error: null,
  };
}