import { payments } from "@/lib/db/mock-db";
import type { Payment } from "@/types/backend";

export function getAllPayments(): Payment[] {
  return payments;
}

export function getPaymentById(id: string): Payment | undefined {
  return payments.find((payment) => payment.id === id);
}

export function getPaymentByOrderId(orderId: string): Payment | undefined {
  return payments.find((payment) => payment.orderId === orderId);
}

export function savePayment(payment: Payment): Payment {
  payments.push(payment);
  return payment;
}

export function updatePayment(
  id: string,
  updates: Partial<Payment>
): Payment | undefined {
  const index = payments.findIndex((payment) => payment.id === id);
  if (index === -1) return undefined;
  payments[index] = { ...payments[index], ...updates };
  return payments[index];
}
