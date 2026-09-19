// components/DeliveryCheckout.tsx
"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Truck,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import type { CartItem } from "./RecipeAssistant";

/* -------------------------------------------------- */
/* Types                                               */
/* -------------------------------------------------- */

export type DeliverySlot = "morning" | "afternoon" | "evening";

export interface DeliveryDetails {
  address: string;
  pincode: string;
  slot: DeliverySlot;
}

/** Up to 4 online payment options available in the customer checkout path. */
export type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "COD";

export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";

export interface PlacedOrder {
  id: string;
  items: CartItem[];
  delivery: DeliveryDetails;
  itemsTotal: number;
  grandTotal: number;
  status: "placed" | "out-for-delivery" | "delivered";
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  placedAt: string;
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof Smartphone;
}[] = [
  { value: "UPI", label: "UPI", hint: "GPay / PhonePe / Paytm", icon: Smartphone },
  { value: "CARD", label: "Card", hint: "Debit / Credit", icon: CreditCard },
  { value: "NETBANKING", label: "Net Banking", hint: "All major banks", icon: Building2 },
  { value: "COD", label: "Cash on Delivery", hint: "Pay when delivered", icon: Banknote },
];

interface DeliveryCheckoutProps {
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: PlacedOrder) => void;
}

const SLOTS: { value: DeliverySlot; label: string }[] = [
  { value: "morning", label: "Morning (8–11 AM)" },
  { value: "afternoon", label: "Afternoon (12–4 PM)" },
  { value: "evening", label: "Evening (5–8 PM)" },
];

const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function itemCost(item: CartItem): number {
  return (item.quantityGrams / 1000) * item.pricePerKg;
}

export default function DeliveryCheckout({
  cart,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}: DeliveryCheckoutProps) {
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [slot, setSlot] = useState<DeliverySlot>("morning");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // No separate delivery fee — delivery cost is folded into vegetable
  // prices, so grand total is simply the sum of cart items.
  const itemsTotal = cart.reduce((sum, item) => sum + itemCost(item), 0);
  const grandTotal = itemsTotal;

  const isPincodeValid = pincode === "" || PINCODE_PATTERN.test(pincode);
  const canPlaceOrder =
    cart.length > 0 &&
    address.trim().length > 0 &&
    PINCODE_PATTERN.test(pincode);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAddress(e.target.value);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Digits only, capped at 6 — keeps the field always in a validatable shape.
    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSlot(e.target.value as DeliverySlot);
  };

  const finalizeOrder = (
    paymentStatus: PaymentStatus,
    transactionId?: string
  ) => {
    const order: PlacedOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      items: cart,
      delivery: { address: address.trim(), pincode, slot },
      itemsTotal,
      grandTotal,
      status: "placed",
      paymentMethod,
      paymentStatus,
      transactionId,
      placedAt: new Date().toISOString(),
    };
    onPlaceOrder(order);
    setPlacedId(order.id);
    setPlacing(false);
    setPaymentProcessing(false);
    onClearCart();
    setAddress("");
    setPincode("");
    setTimeout(() => setPlacedId(null), 4000);
  };

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;
    setPlacing(true);
    setPaymentError("");

    // Cash on Delivery skips the online payment step — payment is tracked
    // as PENDING until it is collected at delivery.
    if (paymentMethod === "COD") {
      setTimeout(() => finalizeOrder("PENDING"), 700);
      return;
    }

    // Demo online payment flow — no real payment gateway wired up yet,
    // matches the existing "Demo payment flow" pattern already used
    // elsewhere in the app (see CustomerMarketplaceFeed.tsx). The order is
    // only created once payment succeeds, so payment status is tracked
    // from the very first order record.
    setPaymentProcessing(true);
    setTimeout(() => {
      const transactionId = `KD-TXN-${Date.now().toString().slice(-8)}`;
      finalizeOrder("PAID", transactionId);
    }, 900);
  };

  return (
    <div className="w-full max-w-full rounded-3xl border border-[#E4DCC8] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF1EC]">
          <Truck className="h-5 w-5 text-[#1B4332]" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#1B4332]">
            Direct Home Delivery
          </h2>
          <p className="text-xs text-[#8A8370]">
            {cart.length === 0
              ? "Your cart is empty — add ingredients from a recipe above"
              : `${cart.length} item${cart.length > 1 ? "s" : ""} in cart`}
          </p>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="mb-5 space-y-2">
          {cart.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center justify-between rounded-xl bg-[#FBF7EF] px-3.5 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-[#1B4332]">
                  {item.name}
                </p>
                <p className="text-xs text-[#8A8370]">
                  {item.quantityGrams} g · {formatINR(item.pricePerKg)}/kg
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#C4622D]">
                  {formatINR(itemCost(item))}
                </span>
                <button
                  onClick={() => onRemoveItem(index)}
                  aria-label={`Remove ${item.name}`}
                  className="text-xs font-medium text-[#8A8370] underline hover:text-[#B44822]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <fieldset disabled={cart.length === 0} className="space-y-4 disabled:opacity-50">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#3D4A42]">
            <MapPin className="h-3.5 w-3.5" /> Delivery Address
          </label>
          <textarea
            value={address}
            onChange={handleAddressChange}
            rows={2}
            placeholder="House no., street, area, city"
            className="w-full resize-none rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm text-[#3D4A42] outline-none focus:border-[#1B4332]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#3D4A42]">
            Pincode
          </label>
          <input
            value={pincode}
            onChange={handlePincodeChange}
            inputMode="numeric"
            placeholder="411001"
            className={
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#3D4A42] outline-none focus:border-[#1B4332] " +
              (isPincodeValid ? "border-[#E4DCC8]" : "border-[#D64545]")
            }
          />
          {!isPincodeValid && (
            <p className="mt-1 text-xs text-[#D64545]">
              Enter a valid 6-digit pincode
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#3D4A42]">
            <Clock className="h-3.5 w-3.5" /> Preferred Slot
          </label>
          <select
            value={slot}
            onChange={handleSlotChange}
            className="w-full rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm text-[#3D4A42] outline-none focus:border-[#1B4332]"
          >
            {SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#3D4A42]">
            <ShieldCheck className="h-3.5 w-3.5" /> Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {PAYMENT_METHODS.map(({ value, label, hint, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={
                  "rounded-2xl border-2 p-3 text-left transition-colors " +
                  (paymentMethod === value
                    ? "border-[#1B4332] bg-[#EAF1EC]"
                    : "border-[#E4DCC8] bg-white")
                }
              >
                <Icon className="h-5 w-5 text-[#1B4332]" />
                <p className="mt-2 text-sm font-semibold text-[#1B4332]">{label}</p>
                <p className="text-[11px] text-[#8A8370]">{hint}</p>
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {cart.length > 0 && (
        <div className="mt-5 space-y-1.5 rounded-xl bg-[#FBF7EF] px-4 py-3">
          <div className="flex justify-between text-sm font-semibold text-[#1B4332]">
            <span>Grand total</span>
            <span>{formatINR(grandTotal)}</span>
          </div>
          <p className="text-[11px] text-[#8A8370]">
            Delivery is included in item prices — no separate delivery fee.
          </p>
        </div>
      )}

      {paymentError && (
        <p className="mt-3 rounded-xl bg-[#FCEFE3] p-3 text-xs font-semibold text-[#B44822]">
          {paymentError}
        </p>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={!canPlaceOrder || placing}
        className="mt-5 w-full rounded-2xl bg-[#1B4332] py-3.5 text-sm font-semibold text-[#FBF7EF] transition-colors hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {paymentProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Processing payment...
          </span>
        ) : placing ? (
          "Placing Order..."
        ) : paymentMethod === "COD" ? (
          "Place Order"
        ) : (
          `Pay ${formatINR(grandTotal)} & Place Order`
        )}
      </button>

      {placedId && (
        <p className="mt-3 text-center text-sm font-medium text-[#2D6A4F]">
          Order {placedId} placed — track it below.
        </p>
      )}
    </div>
  );
}
