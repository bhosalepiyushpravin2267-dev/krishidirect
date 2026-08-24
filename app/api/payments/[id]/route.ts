import { NextResponse } from "next/server";
import { changePaymentStatus, getPayment } from "@/lib/services/payment-service";
import type { PaymentStatus } from "@/types/backend";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const payment = getPayment(id);
  if (!payment) return NextResponse.json({ success: false, data: null, error: "Payment not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: payment, error: null });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const statuses: PaymentStatus[] = ["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"];
    if (!statuses.includes(body.status)) return NextResponse.json({ success: false, data: null, error: "Invalid payment status" }, { status: 400 });
    const result = changePaymentStatus(id, body.status, body.transactionId);
    if (!result.success) return NextResponse.json({ success: false, data: null, error: result.error }, { status: result.code === "NOT_FOUND" ? 404 : 409 });
    return NextResponse.json({ success: true, data: result.payment, error: null });
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Invalid request body" }, { status: 400 });
  }
}
