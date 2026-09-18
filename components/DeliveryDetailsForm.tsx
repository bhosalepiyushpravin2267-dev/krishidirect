// components/DeliveryDetailsForm.tsx
"use client";

import { useState } from "react";
import { MapPin, Clock, Truck } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import type { DeliveryDetails } from "@/types/marketplace";

interface DeliveryDetailsFormProps {
  onComplete: (details: DeliveryDetails) => void;
}

export default function DeliveryDetailsForm({ onComplete }: DeliveryDetailsFormProps) {
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [slot, setSlot] = useState<"morning" | "afternoon" | "evening">("morning");
  const [speed, setSpeed] = useState<"standard" | "express">("standard");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      address,
      pincode,
      slot,
      speed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="address"
            placeholder="Enter your complete address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          placeholder="Enter your pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Delivery Slot</Label>
          <div className="mt-2 space-y-2">
            {["morning", "afternoon", "evening"].map((option) => (
              <Button
                key={option}
                variant={slot === option ? "default" : "outline"}
                onClick={() => setSlot(option as typeof slot)}
                className="w-full capitalize"
                type="button"
              >
                <Clock className="mr-2 h-4 w-4" />
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Delivery Speed</Label>
          <div className="mt-2 space-y-2">
            <Button
              variant={speed === "standard" ? "default" : "outline"}
              onClick={() => setSpeed("standard")}
              className="w-full"
              type="button"
            >
              <Truck className="mr-2 h-4 w-4" />
              Standard
            </Button>
            <Button
              variant={speed === "express" ? "default" : "outline"}
              onClick={() => setSpeed("express")}
              className="w-full"
              type="button"
            >
              <Truck className="mr-2 h-4 w-4" />
              Express
            </Button>
          </div>
        </div>
      </div>

      <Button className="w-full" type="submit">
        Confirm Delivery Details
      </Button>
    </form>
  );
}
