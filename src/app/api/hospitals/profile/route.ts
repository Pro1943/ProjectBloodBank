import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type HospitalProfileUpdate = {
  name: string;
  address: string;
  phone: string;
  phoneCountryCode: string;
  countryLocation: string;
  email: string;
  latitude: number;
  longitude: number;
};

function parseRequiredCoordinate(value: unknown, label: string): number {
  const coordinate = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(coordinate)) {
    throw new Error(`${label} is required`);
  }
  return coordinate;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Hospital profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const updateData: HospitalProfileUpdate = {
      name: body.name,
      address: body.address,
      phone: body.phone,
      phoneCountryCode: body.phoneCountryCode,
      countryLocation: body.countryLocation,
      email: body.email,
      latitude: parseRequiredCoordinate(body.latitude, "Latitude"),
      longitude: parseRequiredCoordinate(body.longitude, "Longitude"),
    };

    const hospital = await db.hospital.update({
      where: { clerkUserId: user.id },
      data: updateData,
    });

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Hospital profile update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update hospital profile" },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
