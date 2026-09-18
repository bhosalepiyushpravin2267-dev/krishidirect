"use client";

import { useState, useMemo } from "react";
import {
    MapPin,
    Thermometer,
    Phone,
    X,
    Warehouse,
    Snowflake,
    Zap,
    Scale,
    Bug,
    Camera,
    Package,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sample data — swap for a real API call (e.g. GET /api/storage-facilities)
// once the backend endpoint exists. Shape matches what the cards/modal expect.
// ---------------------------------------------------------------------------

const CITIES = ["Pune", "Nashik", "Mumbai"];

const FACILITY_TYPES = [
    { value: "all", label: "All Types" },
    { value: "cold-storage", label: "Cold Storage" },
    { value: "dry-warehouse", label: "Dry Warehouse" },
    { value: "ambient-godown", label: "Ambient Godown" },
];

const STORAGE_CONFIGS = [
    { value: "all", label: "All Configurations" },
    { value: "temp-controlled", label: "Temperature-Controlled" },
    { value: "dry-space", label: "Dry Space" },
];

// Facility types that count as "temperature-controlled" vs "dry space" for
// the Storage Configuration filter above.
const TEMP_CONTROLLED_TYPES = new Set(["cold-storage"]);

const AMENITY_ICON = {
    "24/7 Power Backup": Zap,
    Weighbridge: Scale,
    "Pest Controlled": Bug,
    CCTV: Camera,
};

const SAMPLE_FACILITIES = [
    {
        id: "f1",
        name: "Shivneri Cold Chain Hub",
        city: "Pune",
        district: "Hinjewadi, Pune",
        distanceFromMandi: 6,
        type: "cold-storage",
        status: "available",
        tempRange: "2°C to 8°C",
        totalCapacityTonnes: 500,
        availableCapacityTonnes: 210,
        pricing: { unit: "crate-day", rate: 4.5 },
        minBooking: "Min. 7 days",
        amenities: ["24/7 Power Backup", "Weighbridge", "CCTV"],
        phone: "+919876543210",
    },
    {
        id: "f2",
        name: "Godavari Dry Warehouse",
        city: "Nashik",
        district: "Ambad, Nashik",
        distanceFromMandi: 12,
        type: "dry-warehouse",
        status: "available",
        tempRange: "Ambient",
        totalCapacityTonnes: 1200,
        availableCapacityTonnes: 640,
        pricing: { unit: "kg-month", rate: 1.2 },
        minBooking: "Min. 1 month",
        amenities: ["Pest Controlled", "Weighbridge", "CCTV"],
        phone: "+919876500011",
    },
    {
        id: "f3",
        name: "Pawana Ambient Godown",
        city: "Pune",
        district: "Chakan, Pune",
        distanceFromMandi: 18,
        type: "ambient-godown",
        status: "limited",
        tempRange: "Ambient",
        totalCapacityTonnes: 800,
        availableCapacityTonnes: 45,
        pricing: { unit: "kg-month", rate: 0.9 },
        minBooking: "Min. 15 days",
        amenities: ["24/7 Power Backup", "Pest Controlled"],
        phone: "+919876511122",
    },
    {
        id: "f4",
        name: "Konkan Frost Storage",
        city: "Mumbai",
        district: "Vasai, Mumbai",
        distanceFromMandi: 9,
        type: "cold-storage",
        status: "limited",
        tempRange: "-2°C to 4°C",
        totalCapacityTonnes: 350,
        availableCapacityTonnes: 30,
        pricing: { unit: "crate-day", rate: 5.2 },
        minBooking: "Min. 3 days",
        amenities: ["24/7 Power Backup", "Weighbridge", "CCTV", "Pest Controlled"],
        phone: "+919876522233",
    },
    {
        id: "f5",
        name: "Trimurti Dry Warehouse",
        city: "Mumbai",
        district: "Bhiwandi, Mumbai",
        distanceFromMandi: 22,
        type: "dry-warehouse",
        status: "available",
        tempRange: "Ambient",
        totalCapacityTonnes: 2000,
        availableCapacityTonnes: 1150,
        pricing: { unit: "kg-month", rate: 1.0 },
        minBooking: "Min. 1 month",
        amenities: ["Weighbridge", "CCTV"],
        phone: "+919876533344",
    },
    {
        id: "f6",
        name: "Nandur Cold Storage",
        city: "Nashik",
        district: "Niphad, Nashik",
        distanceFromMandi: 14,
        type: "cold-storage",
        status: "available",
        tempRange: "0°C to 6°C",
        totalCapacityTonnes: 420,
        availableCapacityTonnes: 180,
        pricing: { unit: "crate-day", rate: 3.8 },
        minBooking: "Min. 5 days",
        amenities: ["24/7 Power Backup", "Pest Controlled", "CCTV"],
        phone: "+919876544455",
    },
];

// One tonne ≈ 40 standard 25kg crates — used only to translate a farmer's
// "I need X tonnes" input into a crate-day cost estimate. Adjust if your
// actual crate weight standard differs.
const CRATES_PER_TONNE = 40;

function formatINR(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

function StatusBadge({ status }) {
    const isAvailable = status === "available";
    return (
        <span
            className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
                (isAvailable
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800")
            }
        >
            <span
                className={
                    "h-1.5 w-1.5 rounded-full " +
                    (isAvailable ? "bg-emerald-500" : "bg-amber-500")
                }
            />
            {isAvailable ? "Available" : "Limited Space"}
        </span>
    );
}

function FacilityCard({ facility, onReserve }) {
    const capacityPercent = Math.round(
        (facility.availableCapacityTonnes / facility.totalCapacityTonnes) * 100
    );

    const priceLabel =
        facility.pricing.unit === "crate-day"
            ? `${formatINR(facility.pricing.rate)}/crate/day`
            : `${formatINR(facility.pricing.rate)}/kg/month`;

    return (
        <div className="flex w-full max-w-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-emerald-950">
                        {facility.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{facility.district}</span>
                    </p>
                </div>
                <StatusBadge status={facility.status} />
            </div>

            {/* Distance from mandi */}
            <p className="mb-4 text-xs text-gray-500">
                {facility.distanceFromMandi} km from local Mandi
            </p>

            {/* Storage configuration */}
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3">
                <div>
                    <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        <Thermometer className="h-3 w-3" /> Temperature
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-emerald-950">
                        {facility.tempRange}
                    </p>
                </div>
                <div>
                    <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        <Warehouse className="h-3 w-3" /> Capacity
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-emerald-950">
                        {facility.availableCapacityTonnes}T / {facility.totalCapacityTonnes}T
                    </p>
                </div>
            </div>

            {/* Capacity bar */}
            <div className="mb-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${capacityPercent}%` }}
                    />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                    {capacityPercent}% space currently available
                </p>
            </div>

            {/* Pricing */}
            <div className="mb-4">
                <p className="text-lg font-bold text-emerald-800">{priceLabel}</p>
                <p className="text-xs text-gray-500">{facility.minBooking}</p>
            </div>

            {/* Amenities */}
            <div className="mb-5 flex flex-wrap gap-2">
                {facility.amenities.map((amenity) => {
                    const Icon = AMENITY_ICON[amenity] ?? Package;
                    return (
                        <span
                            key={amenity}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600"
                        >
                            <Icon className="h-3 w-3" />
                            {amenity}
                        </span>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                <button
                    onClick={() => onReserve(facility)}
                    className="w-full flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900"
                >
                    Reserve Space
                </button>
                <a
                    href={`tel:${facility.phone}`}
                    className="flex w-full flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-800 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
                >
                    <Phone className="h-4 w-4" />
                    Contact Owner
                </a>
            </div>
        </div>
    );
}

function ReserveModal({ facility, onClose }) {
    const [tonnes, setTonnes] = useState(5);
    const [duration, setDuration] = useState(7);
    const [durationUnit, setDurationUnit] = useState(
        facility.pricing.unit === "crate-day" ? "days" : "months"
    );

    if (!facility) return null;

    const estimatedCost = useMemo(() => {
        const days =
            durationUnit === "days" ? duration : duration * 30;
        const months =
            durationUnit === "months" ? duration : duration / 30;

        if (facility.pricing.unit === "crate-day") {
            const crates = tonnes * CRATES_PER_TONNE;
            return crates * facility.pricing.rate * days;
        }
        // kg-month pricing
        const kg = tonnes * 1000;
        return kg * facility.pricing.rate * months;
    }, [tonnes, duration, durationUnit, facility]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
            >
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-emerald-950">
                            Reserve Space
                        </h3>
                        <p className="text-sm text-gray-500">{facility.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Quantity required (Tonnes)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={tonnes}
                            onChange={(e) => setTonnes(Math.max(1, Number(e.target.value)))}
                            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Duration
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={duration}
                                onChange={(e) =>
                                    setDuration(Math.max(1, Number(e.target.value)))
                                }
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Unit
                            </label>
                            <select
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                            >
                                <option value="days">Days</option>
                                <option value="months">Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                            Estimated Cost
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-900">
                            {formatINR(Math.round(estimatedCost))}
                        </p>
                        <p className="mt-1 text-[11px] text-emerald-700">
                            Based on{" "}
                            {facility.pricing.unit === "crate-day"
                                ? `${formatINR(facility.pricing.rate)}/crate/day (≈${CRATES_PER_TONNE} crates/tonne)`
                                : `${formatINR(facility.pricing.rate)}/kg/month`}
                            . Final quote confirmed by facility owner.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
                    >
                        Confirm Reservation
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StorageFacilities() {
    const [city, setCity] = useState("Pune");
    const [facilityType, setFacilityType] = useState("all");
    const [storageConfig, setStorageConfig] = useState("all");
    const [reserveTarget, setReserveTarget] = useState(null);

    const filteredFacilities = useMemo(() => {
        return SAMPLE_FACILITIES.filter((f) => {
            if (f.city !== city) return false;
            if (facilityType !== "all" && f.type !== facilityType) return false;
            if (storageConfig !== "all") {
                const isTempControlled = TEMP_CONTROLLED_TYPES.has(f.type);
                if (storageConfig === "temp-controlled" && !isTempControlled)
                    return false;
                if (storageConfig === "dry-space" && isTempControlled) return false;
            }
            return true;
        });
    }, [city, facilityType, storageConfig]);

    return (
        <section className="w-full max-w-full bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-800">
                            <Snowflake className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-950 sm:text-3xl">
                            Agri Storage & Cold Chain Matching
                        </h1>
                    </div>
                    <p className="max-w-2xl text-sm text-gray-500 sm:text-base">
                        Find and reserve nearby cold storage, dry warehouses, and godowns
                        so your harvest reaches customers fresh — compare capacity,
                        temperature control, and pricing before you commit.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6 grid w-full grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                            City
                        </label>
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        >
                            {CITIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                            Facility Type
                        </label>
                        <select
                            value={facilityType}
                            onChange={(e) => setFacilityType(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        >
                            {FACILITY_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                            Storage Configuration
                        </label>
                        <select
                            value={storageConfig}
                            onChange={(e) => setStorageConfig(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        >
                            {STORAGE_CONFIGS.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <p className="mb-4 text-sm text-gray-500">
                    {filteredFacilities.length} facilit
                    {filteredFacilities.length === 1 ? "y" : "ies"} found in {city}
                </p>

                {/* Facility grid */}
                {filteredFacilities.length === 0 ? (
                    <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
                        No facilities match these filters yet. Try a different city or
                        facility type.
                    </div>
                ) : (
                    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredFacilities.map((facility) => (
                            <FacilityCard
                                key={facility.id}
                                facility={facility}
                                onReserve={setReserveTarget}
                            />
                        ))}
                    </div>
                )}
            </div>

            {reserveTarget && (
                <ReserveModal
                    facility={reserveTarget}
                    onClose={() => setReserveTarget(null)}
                />
            )}
        </section>
    );
}