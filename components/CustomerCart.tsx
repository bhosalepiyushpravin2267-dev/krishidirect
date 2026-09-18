"use client";

import { useEffect, useMemo, useState } from "react";
import { Truck, X } from "lucide-react";

import {
    EXPRESS_DELIVERY_FEE,
    STANDARD_DELIVERY_FEE,
    cartSubtotal,
} from "@/lib/cart";
import {
    DELIVERY_STATUS_LABEL,
    getHomeDeliveryOrders,
    saveHomeDeliveryOrder,
    updateHomeDeliveryOrder,
} from "@/lib/home-delivery";
import { formatINRExact } from "@/lib/utils";
import type {
    CartItem,
    DeliverySlot,
    DeliverySpeed,
    DeliveryStatus,
    HomeDeliveryOrder,
} from "@/types/marketplace";

interface CustomerCartProps {
    open: boolean;
    onClose: () => void;
    cart: CartItem[];
    onClearCart: () => void;
    onRemoveItem: (id: string) => void;
}

const STATUS_STYLE: Record<DeliveryStatus, string> = {
    placed: "bg-[#FFF4D6] text-[#9A6B00]",
    packed: "bg-[#EAF1EC] text-[#1B4332]",
    "out-for-delivery": "bg-[#E8F1FF] text-[#1D4E89]",
    delivered: "bg-[#EAF1EC] text-[#2D6A4F]",
};

export default function CustomerCart({
    open,
    onClose,
    cart,
    onClearCart,
    onRemoveItem,
}: CustomerCartProps) {
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState("");
    const [slot, setSlot] = useState<DeliverySlot>("morning");
    const [speed, setSpeed] = useState<DeliverySpeed>("standard");
    const [orders, setOrders] = useState<HomeDeliveryOrder[]>([]);
    const [error, setError] = useState("");
    const [placedId, setPlacedId] = useState<string | null>(null);

    const subtotal = useMemo(() => cartSubtotal(cart), [cart]);
    const deliveryFee =
        speed === "express" ? EXPRESS_DELIVERY_FEE : STANDARD_DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const loadOrders = () => {
        setOrders(getHomeDeliveryOrders());
    };

    useEffect(() => {
        loadOrders();
        const handler = () => loadOrders();
        window.addEventListener("krishidirect-delivery-updated", handler);
        return () =>
            window.removeEventListener("krishidirect-delivery-updated", handler);
    }, []);

    if (!open) {
        return null;
    }

    const placeOrder = () => {
        setError("");

        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (!address.trim() || !/^\d{6}$/.test(pincode.trim())) {
            setError("Enter a delivery address and a 6-digit pincode.");
            return;
        }

        const order: HomeDeliveryOrder = {
            id: `home-${Date.now()}`,
            items: cart,
            delivery: {
                address: address.trim(),
                pincode: pincode.trim(),
                slot,
                speed,
            },
            subtotal,
            deliveryFee,
            total,
            status: "placed",
            createdAt: new Date().toISOString(),
        };

        saveHomeDeliveryOrder(order);
        setPlacedId(order.id);
        onClearCart();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1B4332]/30">
            <button
                type="button"
                aria-label="Close cart overlay"
                className="h-full flex-1"
                onClick={onClose}
            />

            <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-[#FBF7EF] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E4DCC8] px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8370]">
                            Direct Home Delivery
                        </p>
                        <h2 className="font-serif text-2xl font-semibold text-[#1B4332]">
                            Your cart
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#E4DCC8] bg-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-6 px-5 py-5">
                    {cart.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-[#E4DCC8] bg-white p-4 text-sm text-[#8A8370]">
                            Cart is empty. Add produce from the marketplace or Recipe Assistant.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {cart.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-start justify-between rounded-2xl border border-[#E4DCC8] bg-white px-3 py-3"
                                >
                                    <div>
                                        <p className="font-medium capitalize text-[#1B4332]">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-[#8A8370]">
                                            {item.quantityKg} kg · {formatINRExact(item.pricePerKg)}/kg
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-[#1B4332]">
                                            {formatINRExact(
                                                item.quantityKg * item.pricePerKg
                                            )}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.id)}
                                            className="text-[11px] text-[#C4622D]"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <section className="rounded-2xl border border-[#E4DCC8] bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-[#1B4332]" />
                            <h3 className="font-semibold text-[#1B4332]">
                                Delivery details
                            </h3>
                        </div>

                        <label className="mb-3 block text-xs font-medium text-[#8A8370]">
                            Delivery address
                            <textarea
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-xl border border-[#E4DCC8] bg-[#FBF7EF] px-3 py-2 text-sm text-[#1B4332] outline-none focus:ring-2 focus:ring-[#1B4332]"
                                placeholder="House / street, area, city"
                            />
                        </label>

                        <label className="mb-3 block text-xs font-medium text-[#8A8370]">
                            Pincode
                            <input
                                value={pincode}
                                onChange={(event) => setPincode(event.target.value)}
                                inputMode="numeric"
                                maxLength={6}
                                className="mt-1 w-full rounded-xl border border-[#E4DCC8] bg-[#FBF7EF] px-3 py-2 text-sm text-[#1B4332] outline-none focus:ring-2 focus:ring-[#1B4332]"
                                placeholder="411001"
                            />
                        </label>

                        <label className="mb-3 block text-xs font-medium text-[#8A8370]">
                            Preferred delivery slot
                            <select
                                value={slot}
                                onChange={(event) =>
                                    setSlot(event.target.value as DeliverySlot)
                                }
                                className="mt-1 w-full rounded-xl border border-[#E4DCC8] bg-[#FBF7EF] px-3 py-2 text-sm text-[#1B4332] outline-none focus:ring-2 focus:ring-[#1B4332]"
                            >
                                <option value="morning">Morning (8am – 12pm)</option>
                                <option value="afternoon">Afternoon (12pm – 4pm)</option>
                                <option value="evening">Evening (4pm – 8pm)</option>
                            </select>
                        </label>

                        <fieldset className="grid grid-cols-2 gap-2">
                            <legend className="mb-2 text-xs font-medium text-[#8A8370]">
                                Delivery speed
                            </legend>
                            <button
                                type="button"
                                onClick={() => setSpeed("standard")}
                                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                                    speed === "standard"
                                        ? "border-[#1B4332] bg-[#EAF1EC]"
                                        : "border-[#E4DCC8]"
                                }`}
                            >
                                <p className="font-semibold text-[#1B4332]">Standard</p>
                                <p className="text-xs text-[#8A8370]">Free · next day</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSpeed("express")}
                                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                                    speed === "express"
                                        ? "border-[#1B4332] bg-[#EAF1EC]"
                                        : "border-[#E4DCC8]"
                                }`}
                            >
                                <p className="font-semibold text-[#1B4332]">Express</p>
                                <p className="text-xs text-[#8A8370]">
                                    {formatINRExact(EXPRESS_DELIVERY_FEE)} · same day
                                </p>
                            </button>
                        </fieldset>
                    </section>

                    <div className="rounded-2xl bg-[#1B4332] p-4 text-[#FBF7EF]">
                        <div className="flex justify-between text-sm">
                            <span>Produce</span>
                            <span>{formatINRExact(subtotal)}</span>
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                            <span>Delivery</span>
                            <span>
                                {deliveryFee === 0
                                    ? "Free"
                                    : formatINRExact(deliveryFee)}
                            </span>
                        </div>
                        <div className="mt-3 flex justify-between font-serif text-xl font-semibold">
                            <span>Total</span>
                            <span>{formatINRExact(total)}</span>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-[#C4622D]">{error}</p>
                    )}

                    {placedId && (
                        <p className="rounded-xl bg-[#EAF1EC] px-3 py-2 text-sm text-[#1B4332]">
                            Order {placedId} placed for direct home delivery.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={placeOrder}
                        className="w-full rounded-2xl bg-[#E8A33D] py-3 text-sm font-semibold text-[#1B4332]"
                    >
                        Place home delivery order
                    </button>

                    {orders.length > 0 && (
                        <section>
                            <h3 className="mb-3 font-serif text-lg font-semibold text-[#1B4332]">
                                Delivery status
                            </h3>
                            <ul className="space-y-3">
                                {orders.map((order) => (
                                    <li
                                        key={order.id}
                                        className="rounded-2xl border border-[#E4DCC8] bg-white p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold text-[#1B4332]">
                                                    {order.id}
                                                </p>
                                                <p className="text-xs text-[#8A8370]">
                                                    {order.delivery.pincode} · {order.delivery.slot} ·{" "}
                                                    {order.delivery.speed}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}
                                            >
                                                {DELIVERY_STATUS_LABEL[order.status]}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-[#1B4332]">
                                            {formatINRExact(order.total)}
                                        </p>
                                        {order.status !== "delivered" && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const next =
                                                        order.status === "placed"
                                                            ? "packed"
                                                            : order.status === "packed"
                                                              ? "out-for-delivery"
                                                              : "delivered";
                                                    updateHomeDeliveryOrder(order.id, {
                                                        status: next,
                                                    });
                                                }}
                                                className="mt-2 text-xs font-semibold text-[#2D6A4F]"
                                            >
                                                Advance delivery status
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </aside>
        </div>
    );
}
