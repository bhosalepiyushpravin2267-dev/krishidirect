// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, HandCoins, Warehouse } from "lucide-react";

import Navbar from "@/components/navbar";
import ImpactStats from "@/components/ImpactStats";
import CustomerMarketplaceFeed from "@/components/CustomerMarketplaceFeed";
import CropListingModal from "@/components/CropListingModal";
import HeroBanner from "@/components/HeroBanner";
import RecipeAssistant, { type CartItem } from "@/components/RecipeAssistant";
import DeliveryCheckout, { type PlacedOrder } from "@/components/DeliveryCheckout";
import OrderTracking from "@/components/OrderTracking";

import { useTranslation } from "@/lib/i18n";
import type {
  CropListing,
  ImpactMetrics,
  UserRole,
} from "@/types/marketplace";

// ---------------------------------------------------------------------------
// Demo seed data
// ---------------------------------------------------------------------------

const MOCK_METRICS: ImpactMetrics = {
  totalProduceSavedKg: 1420,
  farmerEarningsBoostPercent: 28,
  activeCustomerDeals: 34,
  weeklyTrendPercent: 12,
};

const MOCK_LISTINGS: CropListing[] = [
  {
    id: "1",
    farmerId: "f1",
    farmerName: "Ramesh Patil",
    category: "tomato",
    variety: "Deshi Tomato",
    quantity: 8,
    unit: "quintal",
    pricePerUnit: 22,
    harvestedAt: new Date(
      Date.now() - 4 * 60 * 60 * 1000
    ).toISOString(),
    quality: "standard",
    village: "Hinjewadi",
    district: "Pune",
    distanceKm: 6,
    latitude: 18.59,
    longitude: 73.73,
    farmerPhone: "+919876543210",
    isBulkAvailable: true,
    createdAt: new Date().toISOString(),
  },

  {
    id: "2",
    farmerId: "f2",
    farmerName: "Sunita Jadhav",
    category: "onion",
    quantity: 40,
    unit: "kg",
    pricePerUnit: 18,
    harvestedAt: new Date(
      Date.now() - 20 * 60 * 60 * 1000
    ).toISOString(),
    quality: "organic",
    village: "Wagholi",
    district: "Pune",
    distanceKm: 14,
    latitude: 18.58,
    longitude: 73.98,
    farmerPhone: "+919876500011",
    isBulkAvailable: false,
    createdAt: new Date().toISOString(),
  },

  {
    id: "3",
    farmerId: "f3",
    farmerName: "Ganesh More",
    category: "leafy-greens",
    variety: "Palak",
    quantity: 25,
    unit: "kg",
    pricePerUnit: 12,
    harvestedAt: new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString(),
    quality: "organic",
    village: "Baner",
    district: "Pune",
    distanceKm: 3,
    latitude: 18.56,
    longitude: 73.78,
    farmerPhone: "+919876511122",
    isBulkAvailable: false,
    createdAt: new Date().toISOString(),
  },

  {
    id: "4",
    farmerId: "f4",
    farmerName: "Vitthal Kale",
    category: "grains",
    variety: "Jowar",
    quantity: 12,
    unit: "quintal",
    pricePerUnit: 30,
    harvestedAt: new Date(
      Date.now() - 50 * 60 * 60 * 1000
    ).toISOString(),
    quality: "standard",
    village: "Shirur",
    district: "Pune",
    distanceKm: 28,
    latitude: 18.83,
    longitude: 74.37,
    farmerPhone: "+919876522233",
    isBulkAvailable: true,
    createdAt: new Date().toISOString(),
  },

  {
    id: "5",
    farmerId: "f5",
    farmerName: "Meena Shinde",
    category: "fruits",
    variety: "Alphonso Mango",
    quantity: 6,
    unit: "quintal",
    pricePerUnit: 85,
    harvestedAt: new Date(
      Date.now() - 8 * 60 * 60 * 1000
    ).toISOString(),
    quality: "organic",
    village: "Mulshi",
    district: "Pune",
    distanceKm: 19,
    latitude: 18.53,
    longitude: 73.5,
    farmerPhone: "+919876533344",
    isBulkAvailable: true,
    createdAt: new Date().toISOString(),
  },

  {
    id: "6",
    farmerId: "f6",
    farmerName: "Arjun Pawar",
    category: "potato",
    quantity: 15,
    unit: "quintal",
    pricePerUnit: 16,
    harvestedAt: new Date(
      Date.now() - 30 * 60 * 60 * 1000
    ).toISOString(),
    quality: "standard",
    village: "Chakan",
    district: "Pune",
    distanceKm: 22,
    latitude: 18.76,
    longitude: 73.86,
    farmerPhone: "+919876544455",
    isBulkAvailable: true,
    createdAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { t } = useTranslation();

  const [role, setRole] = useState<UserRole>("farmer");

  const [listings, setListings] =
    useState<CropListing[]>(MOCK_LISTINGS);

  const [modalOpen, setModalOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Recipe Assistant cart + order tracking (Customer view only)
  // -------------------------------------------------------------------------

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);

  const handleAddToCart = (items: CartItem[]) => {
    setCart((prev) => [...prev, ...items]);
  };

  // A CropListing's quantity/price come in kg or quintal (1 quintal = 100 kg);
  // the shared cart works in grams + price-per-kg so Recipe Assistant items
  // and marketplace listings sit in the same cart uniformly.
  const listingToCartItem = (listing: CropListing): CartItem => {
    const isQuintal = listing.unit === "quintal";
    return {
      name: listing.variety ?? listing.category,
      quantityGrams: isQuintal ? listing.quantity * 100_000 : listing.quantity * 1000,
      pricePerKg: isQuintal ? listing.pricePerUnit / 100 : listing.pricePerUnit,
    };
  };

  const handleAddListingToCart = (listing: CropListing) => {
    setCart((prev) => [...prev, listingToCartItem(listing)]);
  };

  const handleBuyNowListing = (listing: CropListing) => {
    setCart((prev) => [...prev, listingToCartItem(listing)]);
    setTimeout(() => {
      document
        .getElementById("delivery-checkout")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = (order: PlacedOrder) => {
    setOrders((prev) => [...prev, order]);
  };

  const handleOrderStatusChange = (
    orderId: string,
    status: PlacedOrder["status"]
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // -------------------------------------------------------------------------
  // Create new farmer listing
  // -------------------------------------------------------------------------

  const handleNewListing = (
    partial: Partial<CropListing>
  ) => {
    const newListing: CropListing = {
      id: crypto.randomUUID(),

      farmerId: "self",
      farmerName: "You",

      category: partial.category ?? "tomato",

      quantity: partial.quantity ?? 1,

      unit: partial.unit ?? "kg",

      pricePerUnit:
        partial.pricePerUnit ?? 0,

      harvestedAt:
        partial.harvestedAt ??
        new Date().toISOString(),

      quality:
        partial.quality ?? "standard",

      village: "Your village",

      district: "Pune",

      distanceKm: 0,

      latitude: 18.52,

      longitude: 73.85,

      farmerPhone: "+919999999999",

      isBulkAvailable:
        partial.isBulkAvailable ?? false,

      createdAt:
        new Date().toISOString(),
    };

    setListings((prev) => [
      newListing,
      ...prev,
    ]);
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar
        role={role}
        onRoleChange={setRole}
        cartCount={cart.length}
        onCartClick={() => {
          if (role !== "customer") setRole("customer");
          // Wait a tick for the customer view (and #delivery-checkout) to
          // actually mount before scrolling to it, in case we just switched
          // roles or navigated here from a different route.
          setTimeout(() => {
            document
              .getElementById("delivery-checkout")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">

        {/* IMPACT STATS */}
        <div className="mb-6 w-full">
          <ImpactStats
            metrics={MOCK_METRICS}
          />
        </div>

        {/* ================================================================ */}
        {/* CUSTOMER VIEW                                                      */}
        {/* ================================================================ */}

        {role === "customer" ? (
          <>
            <div className="mb-5">
              <HeroBanner
                imageSrc="/images/customer-hero.jpg"
                variant="customer"
                eyebrow="CUSTOMER PORTAL"
                title={t("dashboard.freshNearYou")}
                subtitle={t("dashboard.customerHeroSubtitle")}
              />
            </div>

            <CustomerMarketplaceFeed
              listings={listings}
              onAddToCart={handleAddListingToCart}
              onBuyNow={handleBuyNowListing}
            />

            {/* ============================================================ */}
            {/* RECIPE ASSISTANT + DELIVERY CHECKOUT + ORDER TRACKING          */}
            {/* ============================================================ */}

            <div className="mt-6">
              <RecipeAssistant onAddToCart={handleAddToCart} />
            </div>

            <div className="mt-6" id="delivery-checkout">
              <DeliveryCheckout
                cart={cart}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>

            <div className="mt-6">
              <OrderTracking
                orders={orders}
                onStatusChange={handleOrderStatusChange}
              />
            </div>
          </>
        ) : (

          /* ================================================================
             FARMER VIEW
             ================================================================ */

          <div className="w-full">

            {/* Farmer welcome hero */}
            <HeroBanner
              imageSrc="/images/farmer-hero.jpg"
              variant="farmer"
              eyebrow="HARVEST SEASON"
              title={t("dashboard.heroTitle")}
              subtitle={t("dashboard.heroDescription")}
            >
              <button
                onClick={() =>
                  setModalOpen(true)
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E8A33D] px-6 py-3.5 text-sm font-semibold text-[#1B4332] shadow-lg transition-transform active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />

                {t(
                  "dashboard.postNewHarvest"
                )}
              </button>
            </HeroBanner>

            {/* ============================================================ */}
            {/* FARMER OFFERS BUTTON                                         */}
            {/* ============================================================ */}

            <div className="mt-6 rounded-3xl border border-[#E4DCC8] bg-white p-5 shadow-sm sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF1EC]">

                      <HandCoins className="h-5 w-5 text-[#1B4332]" />

                    </div>

                    <div>

                      <h2 className="font-serif text-xl font-semibold text-[#1B4332]">
                        Offers Received
                      </h2>

                      <p className="text-xs text-[#8A8370]">
                        View and manage offers from customers
                      </p>

                    </div>

                  </div>

                </div>

                {/* BUTTON TO FARMER OFFERS PAGE */}

                <Link
                  href="/farmer-offers"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-[#FBF7EF] shadow-md transition-all hover:bg-[#2D6A4F] active:scale-[0.98]"
                >

                  <HandCoins className="h-4 w-4" />

                  View Offers Received

                </Link>

              </div>

            </div>

            {/* ============================================================ */}
            {/* STORAGE & COLD CHAIN — FARMER ENTRY POINT                    */}
            {/* ============================================================ */}

            <div className="mt-6 rounded-3xl border border-[#E4DCC8] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF1EC]">
                    <Warehouse className="h-5 w-5 text-[#1B4332]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#1B4332]">
                      Storage &amp; Cold Chain
                    </h2>
                    <p className="text-xs text-[#8A8370]">
                      Find nearby cold storage before your harvest spoils
                    </p>
                  </div>
                </div>

                <Link
                  href="/storage"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-[#FBF7EF] shadow-md transition-all hover:bg-[#2D6A4F] active:scale-[0.98]"
                >
                  <Warehouse className="h-4 w-4" />
                  Find Storage Facilities
                </Link>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ================================================================ */}
      {/* FLOATING FARMER BUTTON                                           */}
      {/* ================================================================ */}

      {role === "farmer" && (
        <button
          onClick={() =>
            setModalOpen(true)
          }
          aria-label="Post new harvest"
          className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#E8A33D] text-[#1B4332] shadow-xl transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* ================================================================ */}
      {/* CROP LISTING MODAL                                               */}
      {/* ================================================================ */}

      <CropListingModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={handleNewListing}
      />

    </div>
  );
}
