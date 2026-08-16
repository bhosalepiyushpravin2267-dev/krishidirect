import { NextResponse } from "next/server";
import { offers } from "@/lib/db/mock-db";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: offers,
    error: null,
  });
}