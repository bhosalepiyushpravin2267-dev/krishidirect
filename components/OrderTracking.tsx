// components/OrderTracking.tsx
"use client";

import { useEffect, useState } from "react";
import { PackageCheck, Truck, Home, MapPin, CreditCard } from "lucide-react";
import type { PlacedOrder, PaymentMethod, PaymentStatus } from "./DeliveryCheckout";

interface OrderTrackingProps {
  orders: PlacedOrder[];
  onStatusChange: (orderId: string, status: PlacedOrder["status"]) => void;
}

const STATUS_META: Record
  PlacedOrder["status"],
  { label: string; icon: typeof PackageCheck; className: string }
> = {
  placed: {
    label: "Order Placed",
    icon: PackageCheck,
    className: "bg-[#FFF4D6] text-[#9A6B00]",
  },
  "out-for-delivery": {
    label: "Out for Delivery",
    icon: Truck,
    className: "bg-[#EAF1EC] text-[#1B4332]",
  },
  delivered: {
    label: "Delivered",
    icon: Home,
    className: "bg-[#DCEAE0] text-[#1B4332]",
  },
};

const PAYMENT_STATUS_META: Record
  PaymentStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: { label: "Payment Pending", className: "bg-[#FFF4D6] text-[#9A6B00]", dot: "bg-[#E8A33D]" },
  PROCESSING: { label: "Payment Processing", className: "bg-[#EAF1EC] text-[#1B4332]", dot: "bg-[#6A8F7B]" },
  PAID: { label: "Payment Received", className: "bg-[#DCEFE3] text-[#1B6B43]", dot: "bg-[#2D6A4F]" },
  FAILED: { label: "Payment Failed", className: "bg-[#FCEFE3] text-[#B44822]", dot: "bg-[#C4622D]" },
};

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  UPI: "UPI",
  CARD: "Card",
  NETBANKING: "Net Banking",
  COD: "Cash on Delivery",
};

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Advances a single order through placed -> out-for-delivery -> delivered on
 * a timer, purely for demo purposes (no real logistics provider wired up yet —
 * same "demo flow" pattern as the payment step elsewhere in the app). */
function useDemoStatusProgress(
  order: PlacedOrder,
  onStatusChange: OrderTrackingProps["onStatusChange"]
) {
  useEffect(() => {
    if (order.status === "delivered") return;

    const nextStatus: PlacedOrder["status"] =
      order.status === "placed" ? "out-for-delivery" : "delivered";

    const timer = setTimeout(() => {
      onStatusChange(order.id, nextStatus);
    }, 6000);

    return () => clearTimeout(timer);
  }, [order.id, order.status, onStatusChange]);
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: PlacedOrder;
  onStatusChange: OrderTrackingProps["onStatusChange"];
}) {
  useDemoStatusProgress(order, onStatusChange);

  const meta = STATUS_META[order.status];
  const StatusIcon = meta.icon;

  // Orders placed before payment tracking was added won't carry these
  // fields — fall back so older stored orders still render correctly.
  const paymentStatus = order.paymentStatus ?? "PENDING";
  const paymentMethod = order.paymentMethod ?? "COD";
  const paymentMeta = PAYMENT_STATUS_META[paymentStatus];

  return (
    <div className="w-full max-w-full rounded-2xl border border-[#E4DCC8] bg-[#FBF7EF] p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#1B4332]">{order.id}</p>
          <p className="text-xs text-[#8A8370]">
            {order.items.length} item{order.items.length > 1 ? "s" : ""} ·{" "}
            {formatINR(order.grandTotal)}
          </p>
        </div>
        <span
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
            meta.className
          }
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-[#8A8370]">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          {order.delivery.address} — {order.delivery.pincode}
        </span>
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
            paymentMeta.className
          }
        >
          <span className={"h-1.5 w-1.5 rounded-full " + paymentMeta.dot} />
          {paymentMeta.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#8A8370]">
          <CreditCard className="h-3 w-3" />
          {PAYMENT_METHOD_LABEL[paymentMethod]}
        </span>
        {order.transactionId && (
          <span className="text-[11px] text-[#8A8370]">· {order.transactionId}</span>
        )}
      </div>

      {/* Progress steps */}
      <div className="mt-3 flex items-center gap-1.5">
        {(["placed", "out-for-delivery", "delivered"] as const).map(
          (step, index) => {
            const stepIndex = ["placed", "out-for-delivery", "delivered"].indexOf(
              order.status
            );
            const isDone = index <= stepIndex;
            return (
              <div
                key={step}
                className={
                  "h-1.5 flex-1 rounded-full transition-colors " +
                  (isDone ? "bg-[#1B4332]" : "bg-[#E4DCC8]")
                }
              />
            );
          }
        )}
      </div>
    </div>
  );
}

export default function OrderTracking({ orders, onStatusChange }: OrderTrackingProps) {
  const [expanded, setExpanded] = useState(true);

  if (orders.length === 0) return null;

  return (
    <div className="w-full max-w-full rounded-3xl border border-[#E4DCC8] bg-white p-5 shadow-sm sm:p-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mb-4 flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF1EC]">
            <Truck className="h-5 w-5 text-[#1B4332]" />
          </div>
          <div className="text-left">
            <h2 className="font-serif text-xl font-semibold text-[#1B4332]">
              Order Tracking
            </h2>
            <p className="text-xs text-[#8A8370]">
              {orders.length} order{orders.length > 1 ? "s" : ""} in progress
            </p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="space-y-3">
          {orders
            .slice()
            .reverse()
            .map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
              />
            ))}
        </div>
      )}
    </div>
  );
}
