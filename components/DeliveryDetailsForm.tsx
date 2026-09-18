"use client";

import { useState } from "react";
import { MapPin, Clock, Truck } from "lucide-react";
import { HomeDeliveryDetails } from "../types/marketplace";

interface DeliveryDetailsFormProps {
  onComplete: (details: HomeDeliveryDetails) => void;
}

export default function DeliveryDetailsForm({ onComplete }: DeliveryDetailsFormProps) {
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [slot, setSlot] = useState<"morning" | "afternoon" | "evening">("morning");
  const [speed, setSpeed] = useState<"standard" | "express">("standard");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onComplete({
      address,
      pincode,
      slot,
      speed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Truck className="w-5 h-5 text-green-600" /> Direct Home Delivery Details
      </h3>

      <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
          <MapPin className="w-4 h-4" /> Delivery Address
        </label>
        <textarea
          required
          value={address}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
          placeholder="Enter full street address"
          className="w-full border p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pincode</label>
        <input
          type="text"
          required
          value={pincode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPincode(e.target.value)}
          placeholder="6-digit Pincode"
          className="w-full border p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
          <Clock className="w-4 h-4" /> Delivery Slot
        </label>
        <select
          value={slot}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSlot(e.target.value as "morning" | "afternoon" | "evening")
          }
          className="w-full border p-2 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
          <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
          <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Delivery Speed</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="speed"
              value="standard"
              checked={speed === "standard"}
              onChange={() => setSpeed("standard")}
            />
            Standard Delivery
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="speed"
              value="express"
              checked={speed === "express"}
              onChange={() => setSpeed("express")}
            />
            Express Delivery
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Confirm Delivery Details
      </button>
    </form>
  );
}