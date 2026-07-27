import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
        latitude: body.latitude,
        longitude: body.longitude,
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
      { error: "Failed to create hospital" },
      { status: 500 }
    );
  }
}
