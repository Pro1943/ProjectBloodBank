import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function parseRequiredCoordinate(value: unknown, label: string): number {
  const coordinate = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(coordinate)) {
    throw new Error(`${label} is required`);
  }
  return coordinate;
}

export async function GET() {
  try {
    const hospitals = await db.hospital.findMany({
      select: { id: true, name: true },
    });
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error("Hospital list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const latitude = parseRequiredCoordinate(body.latitude, "Latitude");
    const longitude = parseRequiredCoordinate(body.longitude, "Longitude");

    // Check if hospital already exists with this email
    const existingByEmail = await db.hospital.findFirst({
      where: { email: body.email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: "Hospital with this email already exists" },
        { status: 409 }
      );
    }

    // Check if this user already created a hospital
    const existingByUser = await db.hospital.findUnique({
      where: { clerkUserId: body.clerkUserId },
    });

    if (existingByUser) {
      return NextResponse.json(
        { error: "You have already created a hospital account" },
        { status: 409 }
      );
    }

    const hospital = await db.hospital.create({
      data: {
        clerkUserId: body.clerkUserId,
        name: body.name,
        address: body.address,
        latitude,
        longitude,
        phone: body.phone,
        phoneCountryCode: body.phoneCountryCode,
        countryLocation: body.countryLocation,
        email: body.email,
      },
    });

    return NextResponse.json(hospital, { status: 201 });
  } catch (error) {
    console.error("Hospital creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create hospital" },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
