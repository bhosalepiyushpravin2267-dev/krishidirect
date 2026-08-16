import type { Offer, Order, User, OtpRecord } from "@/types/backend";

export const offers: Offer[] = [];

export const orders: Order[] = [];

export const users: User[] = [
  {
    id: "farmer-001",
    name: "Demo Farmer",
    phone: "9999999999",
    email: "farmer@example.com",
    role: "FARMER",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vendor-001",
    name: "Demo Vendor",
    phone: "8888888888",
    email: "vendor@example.com",
    role: "VENDOR",
    createdAt: new Date().toISOString(),
  },
];

export const otpRecords: OtpRecord[] = [];