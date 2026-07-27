import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    return NextResponse.json(donor);
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

    const updateData: any = {
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
    if (body.latitude !== undefined && body.latitude !== null) {
      updateData.latitude = parseFloat(body.latitude);
    }
    if (body.longitude !== undefined && body.longitude !== null) {
      updateData.longitude = parseFloat(body.longitude);
    }
    if (body.hospitalAffiliationId !== undefined) {
      updateData.hospitalAffiliationId = body.hospitalAffiliationId || null;
    }

    const donor = await db.donor.update({
      where: { clerkUserId: user.id },
      data: updateData,
      include: { hospitalAffiliation: true },
    });

    return NextResponse.json(donor);
  } catch (error) {
    console.error("Donor profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update donor profile" },
      { status: 500 }
    );
  }
}
