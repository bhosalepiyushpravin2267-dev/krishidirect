// components/DeliveryCheckout.tsx
"use client";

import { useState } from "react";
import { MapPin, Clock, Zap, Truck } from "lucide-react";
import type { CartItem } from "./RecipeAssistant";

/* -------------------------------------------------- */
/* Types                                               */
/* -------------------------------------------------- */

export type DeliverySlot = "morning" | "afternoon" | "evening";
export type DeliverySpeed = "standard" | "express";

export interface DeliveryDetails {
  address: string;
  pincode: string;
  slot: DeliverySlot;
  speed: DeliverySpeed;
}

export interface PlacedOrder {
  id: string;
  items: CartItem[];
  delivery: DeliveryDetails;
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
  status: "placed" | "out-for-delivery" | "delivered";
  placedAt: string;
}

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

const EXPRESS_FEE = 49;
const STANDARD_FEE = 19;
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
  const [speed, setSpeed] = useState<DeliverySpeed>("standard");
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);

  const itemsTotal = cart.reduce((sum, item) => sum + itemCost(item), 0);
  const deliveryFee = speed === "express" ? EXPRESS_FEE : STANDARD_FEE;
  const grandTotal = itemsTotal + (cart.length > 0 ? deliveryFee : 0);

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

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(e.target.value as DeliverySpeed);
  };

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;
    setPlacing(true);

    // Demo checkout flow — no real payment/logistics gateway wired up yet,
    // matches the existing "Demo payment flow" pattern already used
    // elsewhere in the app (see CustomerMarketplaceFeed.tsx).
    setTimeout(() => {
      const order: PlacedOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        items: cart,
        delivery: { address: address.trim(), pincode, slot, speed },
        itemsTotal,
        deliveryFee,
        grandTotal,
        status: "placed",
        placedAt: new Date().toISOString(),
      };
      onPlaceOrder(order);
      setPlacedId(order.id);
      setPlacing(false);
      onClearCart();
      setAddress("");
      setPincode("");
      setTimeout(() => setPlacedId(null), 4000);
    }, 700);
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
            <Zap className="h-3.5 w-3.5" /> Delivery Speed
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "standard" as DeliverySpeed, label: "Standard", fee: STANDARD_FEE },
                { value: "express" as DeliverySpeed, label: "Express", fee: EXPRESS_FEE },
              ]
            ).map((option) => (
              <label
                key={option.value}
                className={
                  "flex cursor-pointer flex-col items-start rounded-xl border-2 px-3.5 py-2.5 text-sm transition-colors " +
                  (speed === option.value
                    ? "border-[#1B4332] bg-[#EAF1EC]"
                    : "border-[#E4DCC8] bg-white")
                }
              >
                <input
                  type="radio"
                  name="delivery-speed"
                  value={option.value}
                  checked={speed === option.value}
                  onChange={handleSpeedChange}
                  className="sr-only"
                />
                <span className="font-medium text-[#1B4332]">
                  {option.label}
                </span>
                <span className="text-xs text-[#8A8370]">
                  {formatINR(option.fee)} delivery fee
                </span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {cart.length > 0 && (
        <div className="mt-5 space-y-1.5 rounded-xl bg-[#FBF7EF] px-4 py-3">
          <div className="flex justify-between text-sm text-[#3D4A42]">
            <span>Items total</span>
            <span>{formatINR(itemsTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#3D4A42]">
            <span>Delivery fee</span>
            <span>{formatINR(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E4DCC8] pt-1.5 text-sm font-semibold text-[#1B4332]">
            <span>Grand total</span>
            <span>{formatINR(grandTotal)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={!canPlaceOrder || placing}
        className="mt-5 w-full rounded-2xl bg-[#1B4332] py-3.5 text-sm font-semibold text-[#FBF7EF] transition-colors hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {placing ? "Placing Order..." : "Place Order"}
      </button>

      {placedId && (
        <p className="mt-3 text-center text-sm font-medium text-[#2D6A4F]">
          Order {placedId} placed — track it below.
        </p>
      )}
    </div>
  );
}
