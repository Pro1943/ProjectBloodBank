import { db } from "@/lib/db";
import { cleanupOldCompletedData } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const DONATION_COOLDOWN_DAYS = 90;

export async function GET() {
  try {
    await cleanupOldCompletedData();

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const donors = await db.donor.findMany({
      where: { hospitalAffiliationId: hospital.id },
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bloodType: true,
        address: true,
        isAvailable: true,
        lastDonationDate: true,
      },
    });

    const now = new Date();
    const enrichedDonors = donors.map((donor) => {
      const daysSinceDonation = donor.lastDonationDate
        ? Math.floor((now.getTime() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const inCooldown = daysSinceDonation !== null && daysSinceDonation < DONATION_COOLDOWN_DAYS;
      const canDonate = donor.isAvailable && !inCooldown;

      return {
        ...donor,
        canDonate,
      };
    });

    return NextResponse.json(enrichedDonors);
  } catch (error) {
    console.error("Hospital donor fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const body = await request.json();
    const { donorId, isAvailable } = body;

    const donor = await db.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor || donor.hospitalAffiliationId !== hospital.id) {
      return NextResponse.json({ error: "Donor not found or not authorized" }, { status: 404 });
    }

    const updatedDonor = await db.donor.update({
      where: { id: donorId },
      data: {
        isAvailable,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bloodType: true,
        address: true,
        isAvailable: true,
        lastDonationDate: true,
      },
    });

    return NextResponse.json(updatedDonor);
  } catch (error) {
    console.error("Hospital donor update error:", error);
    return NextResponse.json({ error: "Failed to update donor" }, { status: 500 });
  }
}
