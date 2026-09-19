// components/FarmerOffers.tsx
"use client";

import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Check,
    CircleCheck,
    Clock,
    IndianRupee,
    Package,
    PackageCheck,
    Truck,
    User,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
    updateOffer,
    refreshOffersFromServer,
    type DealStage,
    type MarketplaceOffer,
    type PaymentMethod,
    type PaymentStatus,
} from "@/lib/marketplaceOffers";

const DEAL_STAGES: {
    id: DealStage;
    label: string;
    description: string;
}[] = [
        {
            id: "offer-received",
            label: "Offer Received",
            description: "Customer has submitted an offer.",
        },
        {
            id: "offer-accepted",
            label: "Offer Accepted",
            description: "Farmer accepted the customer's offer.",
        },
        {
            id: "pickup-arranged",
            label: "Pickup Arranged",
            description: "Pickup has been arranged.",
        },
        {
            id: "completed",
            label: "Completed",
            description: "Transaction completed successfully.",
        },
    ];

function getStageIndex(stage: DealStage) {
    return DEAL_STAGES.findIndex((item) => item.id === stage);
}

function StatusBadge({ status }: { status: MarketplaceOffer["status"] }) {
    if (status === "pending") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D6] px-3 py-1.5 text-xs font-semibold text-[#9A6B00]">
                <span className="h-2 w-2 rounded-full bg-[#E8A33D]" />
                🟡 Pending
            </span>
        );
    }

    if (status === "accepted") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF1EC] px-3 py-1.5 text-xs font-semibold text-[#1B6B43]">
                <span className="h-2 w-2 rounded-full bg-[#2D6A4F]" />
                🟢 Accepted
            </span>
        );
    }

    if (status === "cancelled") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EDE5] px-3 py-1.5 text-xs font-semibold text-[#6F685B]">
                Cancelled
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCEFE3] px-3 py-1.5 text-xs font-semibold text-[#B44822]">
            <span className="h-2 w-2 rounded-full bg-[#C4622D]" />
            🔴 Rejected
        </span>
    );
}

function PaymentStatus({ status }: { status?: PaymentStatus }) {
    const value = status ?? "PENDING";
    const map: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
        PENDING: { label: "Payment Pending", cls: "bg-[#FFF4D6] text-[#9A6B00]", dot: "bg-[#E8A33D]" },
        PROCESSING: { label: "Payment Processing", cls: "bg-[#EAF1EC] text-[#1B4332]", dot: "bg-[#6A8F7B]" },
        PAID: { label: "Payment Received", cls: "bg-[#DCEFE3] text-[#1B6B43]", dot: "bg-[#2D6A4F]" },
        FAILED: { label: "Payment Failed", cls: "bg-[#FCEFE3] text-[#B44822]", dot: "bg-[#C4622D]" },
        REFUNDED: { label: "Payment Refunded", cls: "bg-[#F1E8F7] text-[#6B3F7A]", dot: "bg-[#8E5EA8]" },
    };
    const item = map[value];
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${item.cls}`}>
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            {item.label}
        </span>
    );
}

function methodLabel(method?: PaymentMethod) {
    if (method === "UPI") return "UPI";
    if (method === "CARD") return "Card";
    if (method === "BANK_TRANSFER") return "Bank Transfer";
    if (method === "PAY_ON_PICKUP") return "Cash on Pickup";
    return "Not selected";
}

function DealProgress({ offer }: { offer: MarketplaceOffer }) {
    const currentIndex = getStageIndex(offer.dealStage);
    return (
        <div className="mt-6 rounded-2xl bg-[#FBF7EF] p-5">
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8370]">Deal Status</p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-[#1B4332]">Transaction Progress</h3>
            </div>

            <div className="space-y-4">
                {DEAL_STAGES.map((stage, index) => {
                    const completed = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                        <div key={stage.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                                <div className={`grid h-9 w-9 place-items-center rounded-full ${completed ? "bg-[#1B4332] text-white" : "bg-[#E4DCC8] text-[#8A8370]"}`}>
                                    {index === 0 && <Clock className="h-4 w-4" />}
                                    {index === 1 && <Check className="h-4 w-4" />}
                                    {index === 2 && <Truck className="h-4 w-4" />}
                                    {index === 3 && <CircleCheck className="h-4 w-4" />}
                                </div>
                                {index < DEAL_STAGES.length - 1 && (
                                    <div className={`mt-1 h-7 w-0.5 ${index < currentIndex ? "bg-[#1B4332]" : "bg-[#E4DCC8]"}`} />
                                )}
                            </div>
                            <div className="pt-1">
                                <p className={`text-sm font-semibold ${completed ? "text-[#1B4332]" : "text-[#8A8370]"}`}>
                                    {stage.label}
                                    {isCurrent && (
                                        <span className="ml-2 rounded-full bg-[#E8A33D] px-2 py-0.5 text-[10px] font-semibold text-[#1B4332]">Current</span>
                                    )}
                                </p>
                                <p className="mt-0.5 text-xs text-[#8A8370]">{stage.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {offer.status === "accepted" && offer.dealStage === "offer-accepted" && offer.paymentStatus !== "PAID" && (
                <div className="mt-5 rounded-xl border border-[#E8D5A6] bg-[#FFF4D6] p-4 text-center">
                    <p className="text-sm font-semibold text-[#9A6B00]">Waiting for the customer to complete payment.</p>
                    <p className="mt-1 text-xs text-[#8A8370]">Pickup can be arranged after payment is received.</p>
                </div>
            )}

            {offer.status === "accepted" && offer.dealStage === "offer-accepted" && offer.paymentStatus === "PAID" && (
                <button
                    type="button"
                    onClick={() => updateOffer(offer.id, { dealStage: "pickup-arranged" })}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] py-3 text-sm font-semibold text-white"
                >
                    <Truck className="h-4 w-4" />
                    Arrange Pickup
                </button>
            )}

            {offer.status === "accepted" && offer.dealStage === "pickup-arranged" && (
                <button
                    type="button"
                    onClick={() => updateOffer(offer.id, { dealStage: "completed" })}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] py-3 text-sm font-semibold text-white"
                >
                    <PackageCheck className="h-4 w-4" />
                    Mark as Completed
                </button>
            )}

            {offer.dealStage === "completed" && (
                <div className="mt-5 rounded-xl bg-[#EAF1EC] p-4 text-center text-sm font-semibold text-[#1B4332]">
                    <CircleCheck className="mx-auto mb-2 h-5 w-5" />
                    Deal Completed Successfully
                </div>
            )}
        </div>
    );
}

function FarmerPaymentInfo({ offer }: { offer: MarketplaceOffer }) {
    const amount = offer.quantity * offer.offeredPricePerUnit;
    return (
        <section className="mt-6 rounded-3xl border border-[#E4DCC8] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#E4DCC8] bg-[#FBF7EF] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8370]">Payment</p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-[#1B4332]">Customer Payment Status</h3>
                    <p className="mt-1 text-xs text-[#8A8370]">The customer is responsible for paying the accepted offer.</p>
                </div>
                <PaymentStatus status={offer.paymentStatus} />
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-2xl bg-[#EAF1EC] p-4">
                    <p className="text-xs text-[#8A8370]">Amount</p>
                    <p className="mt-1 flex items-center font-serif text-xl font-semibold text-[#1B4332]"><IndianRupee className="h-4 w-4" />{amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-2xl bg-[#FBF7EF] p-4">
                    <p className="text-xs text-[#8A8370]">Payment Method</p>
                    <p className="mt-1 font-semibold text-[#1B4332]">{methodLabel(offer.paymentMethod)}</p>
                </div>
                <div className="rounded-2xl bg-[#FBF7EF] p-4">
                    <p className="text-xs text-[#8A8370]">Transaction ID</p>
                    <p className="mt-1 break-all text-sm font-semibold text-[#1B4332]">{offer.transactionId ?? "Waiting for payment"}</p>
                </div>
            </div>

            {offer.paymentStatus === "PAID" && (
                <div className="mx-5 mb-5 rounded-2xl border border-[#B9D9C5] bg-[#EAF1EC] p-4 text-center sm:mx-6 sm:mb-6">
                    <p className="text-sm font-semibold text-[#1B6B43]">✓ Payment received from the customer.</p>
                    <p className="mt-1 text-xs text-[#5F786A]">The crop can now move to pickup arrangements.</p>
                </div>
            )}
        </section>
    );
}

export default function FarmerOffers() {
    const router = useRouter();
    const [offers, setOffers] = useState<MarketplaceOffer[]>([]);

    const loadOffers = async () => {
        const allOffers = await refreshOffersFromServer();
        setOffers(allOffers);
    };

    useEffect(() => {
        loadOffers();
        const handler = () => loadOffers();
        // The custom event covers updates made in this tab; "storage" is what
        // fires when the customer pays from a different tab/window, which is
        // why payment status could appear stuck without a manual refresh.
        window.addEventListener("krishidirect-offers-updated", handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener("krishidirect-offers-updated", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    const handleAccept = (offer: MarketplaceOffer) => {
        updateOffer(offer.id, {
            status: "accepted",
            dealStage: "offer-accepted",
            paymentStatus: "PENDING",
        });
        loadOffers();
    };

    const handleReject = (offer: MarketplaceOffer) => {
        updateOffer(offer.id, { status: "rejected" });
        loadOffers();
    };

    return (
        <main className="min-h-screen bg-[#FBF7EF] px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B4332] shadow-sm hover:bg-[#EAF1EC]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Main Page
                </button>

                <section className="mb-6 rounded-3xl bg-[#1B4332] p-6 text-[#FBF7EF] shadow-lg sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E8A33D] text-[#1B4332]">
                            <PackageCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#B9C9BB]">KrishiDirect</p>
                            <h1 className="font-serif text-3xl font-semibold">Offers Received</h1>
                            <p className="mt-1 text-sm text-[#D8E5DC]">Review customer offers, payment status and deal progress.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-6 rounded-2xl border border-[#E4DCC8] bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8A8370]">Offer Status</p>
                    <div className="flex flex-wrap gap-3">
                        <StatusBadge status="pending" />
                        <StatusBadge status="accepted" />
                        <StatusBadge status="rejected" />
                    </div>
                </section>

                {offers.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-[#E4DCC8] bg-white p-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-[#B9C9BB]" />
                        <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1B4332]">No offers yet</h2>
                        <p className="mt-2 text-sm text-[#8A8370]">When customers make offers on your crops, they will appear here.</p>
                        <button type="button" onClick={() => router.push("/")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-white">
                            <ArrowLeft className="h-4 w-4" />
                            Go to Marketplace
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {offers.map((offer) => (
                        <section key={offer.id} className="rounded-3xl border border-[#E4DCC8] bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#EAF1EC] text-[#1B4332]"><User className="h-6 w-6" /></div>
                                    <div>
                                        <p className="font-semibold text-[#1B4332]">{offer.customerName}</p>
                                        <p className="text-xs text-[#8A8370]">Customer offer</p>
                                    </div>
                                </div>
                                <StatusBadge status={offer.status} />
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-[#FBF7EF] p-4"><p className="text-xs text-[#8A8370]">Crop</p><p className="mt-1 font-semibold capitalize text-[#1B4332]">{offer.crop}</p></div>
                                <div className="rounded-2xl bg-[#FBF7EF] p-4"><p className="text-xs text-[#8A8370]">Quantity</p><p className="mt-1 font-semibold text-[#1B4332]">{offer.quantity} {offer.unit}</p></div>
                                <div className="rounded-2xl bg-[#FCEFE3] p-4"><p className="text-xs text-[#8A8370]">Offered Price</p><p className="mt-1 flex items-center font-semibold text-[#C4622D]"><IndianRupee className="h-4 w-4" />{offer.offeredPricePerUnit}/{offer.unit}</p></div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-[#E4DCC8] p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div><p className="text-xs text-[#8A8370]">Your Listed Price</p><p className="font-semibold text-[#3D4A42]">₹{offer.originalPricePerUnit}/{offer.unit}</p></div>
                                <div><p className="text-xs text-[#8A8370]">Total Offer Value</p><p className="font-serif text-xl font-semibold text-[#1B4332]">₹{(offer.quantity * offer.offeredPricePerUnit).toLocaleString("en-IN")}</p></div>
                            </div>

                            {offer.status === "pending" && (
                                <div className="mt-5 flex gap-3">
                                    <button type="button" onClick={() => handleAccept(offer)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B4332] py-3 text-sm font-semibold text-white"><Check className="h-4 w-4" />Accept</button>
                                    <button type="button" onClick={() => handleReject(offer)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FCEFE3] py-3 text-sm font-semibold text-[#C4622D]"><X className="h-4 w-4" />Reject</button>
                                </div>
                            )}

                            {offer.status === "accepted" && (
                                <>
                                    <FarmerPaymentInfo offer={offer} />
                                    <DealProgress offer={offer} />
                                </>
                            )}

                            {offer.status === "rejected" && (
                                <div className="mt-5 rounded-2xl bg-[#FCEFE3] p-4 text-center"><p className="text-sm font-semibold text-[#B44822]">🔴 This offer has been rejected.</p></div>
                            )}

                            {offer.status === "cancelled" && (
                                <div className="mt-5 rounded-2xl bg-[#F1EDE5] p-4 text-center"><p className="text-sm font-semibold text-[#6F685B]">This offer was cancelled by the customer.</p></div>
                            )}
                        </section>
                    ))}
                </div>

                {offers.length > 0 && (
                    <div className="mt-8 flex justify-center pb-8">
                        <button type="button" onClick={() => router.push("/")} className="inline-flex items-center gap-2 rounded-2xl bg-[#1B4332] px-7 py-3.5 text-sm font-semibold text-white shadow-lg">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Main Page
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
