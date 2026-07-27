import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const updateData: any = {
      name: body.name,
      address: body.address,
      phone: body.phone,
      phoneCountryCode: body.phoneCountryCode,
      countryLocation: body.countryLocation,
      email: body.email,
    };

    if (body.latitude !== undefined && body.latitude !== null) {
      updateData.latitude = parseFloat(body.latitude);
    }
    if (body.longitude !== undefined && body.longitude !== null) {
      updateData.longitude = parseFloat(body.longitude);
    }

    const hospital = await db.hospital.update({
      where: { clerkUserId: user.id },
      data: updateData,
    });

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Hospital profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update hospital profile" },
      { status: 500 }
    );
  }
}
