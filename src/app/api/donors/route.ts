import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if donor already exists with this email
    const existingByEmail = await db.donor.findFirst({
      where: { email: body.email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: "Donor account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if this user already created a donor profile
    const existingByUser = await db.donor.findUnique({
      where: { clerkUserId: body.clerkUserId },
    });

    if (existingByUser) {
      return NextResponse.json(
        { error: "You have already created a donor profile" },
        { status: 409 }
      );
    }

    const donor = await db.donor.create({
      data: {
        clerkUserId: body.clerkUserId,
        firstName: body.firstName,
        lastName: body.lastName,
        bloodType: body.bloodType,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        phone: body.phone,
        phoneCountryCode: body.phoneCountryCode,
        countryLocation: body.countryLocation,
        email: body.email,
        hospitalAffiliationId: body.hospitalAffiliationId,
      },
    });

    return NextResponse.json(donor, { status: 201 });
  } catch (error) {
    console.error("Donor creation error:", error);
    return NextResponse.json(
      { error: "Failed to create donor profile" },
      { status: 500 }
    );
  }
}
