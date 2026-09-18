import { NextResponse } from "next/server";
import { createPayment, getPayments } from "@/lib/services/payment-service";
import type { PaymentMethod } from "@/types/backend";

export async function GET() {
  return NextResponse.json({ success: true, data: getPayments(), error: null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const methods: PaymentMethod[] = ["UPI", "CARD", "COD"];
    if (typeof body.orderId !== "string" || !methods.includes(body.method)) {
      return NextResponse.json({ success: false, data: null, error: "orderId and method (UPI, CARD, or COD) are required" }, { status: 400 });
    }
    const result = createPayment({ orderId: body.orderId, method: body.method });
    if (!result.success) return NextResponse.json({ success: false, data: null, error: result.error }, { status: 409 });
    return NextResponse.json({ success: true, data: result.payment, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Invalid JSON request body" }, { status: 400 });
  }
}
