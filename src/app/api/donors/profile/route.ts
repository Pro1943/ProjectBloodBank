import { db } from "@/lib/db";
import { getDonorAvailability } from "@/lib/availability";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type DonorProfileUpdate = {
  firstName: string;
  lastName: string;
  bloodType: string;
  phone: string;
  phoneCountryCode: string;
  countryLocation: string;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  hospitalAffiliationId?: string | null;
  isAvailabilityOptedIn?: boolean;
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

    const donor = await db.donor.findUnique({
      where: { clerkUserId: user.id },
      include: { hospitalAffiliation: true },
    });

    if (!donor) {
      return NextResponse.json(
        { error: "Donor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...donor,
      ...getDonorAvailability(donor),
    });
  } catch (error) {
    console.error("Donor profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const updateData: DonorProfileUpdate = {
      firstName: body.firstName,
      lastName: body.lastName,
      bloodType: body.bloodType,
      phone: body.phone,
      phoneCountryCode: body.phoneCountryCode,
      countryLocation: body.countryLocation,
    };

    if (body.address !== undefined) {
      updateData.address = body.address;
    }
    updateData.latitude = parseRequiredCoordinate(body.latitude, "Latitude");
    updateData.longitude = parseRequiredCoordinate(body.longitude, "Longitude");
    if (body.hospitalAffiliationId !== undefined) {
      updateData.hospitalAffiliationId = body.hospitalAffiliationId || null;
    }
    if (body.isAvailabilityOptedIn !== undefined) {
      updateData.isAvailabilityOptedIn = Boolean(body.isAvailabilityOptedIn);
    }

    const donor = await db.donor.update({
      where: { clerkUserId: user.id },
      data: updateData,
      include: { hospitalAffiliation: true },
    });

    return NextResponse.json({
      ...donor,
      ...getDonorAvailability(donor),
    });
  } catch (error) {
    console.error("Donor profile update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update donor profile" },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
