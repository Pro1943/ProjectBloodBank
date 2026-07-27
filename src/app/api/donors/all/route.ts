import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const DONATION_COOLDOWN_DAYS = 90;

export async function GET() {
  try {
    const donors = await db.donor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bloodType: true,
        isAvailable: true,
        lastDonationDate: true,
      },
      orderBy: { lastName: "asc" },
    });

    // Calculate eligibility based on 90-day cooldown
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
        daysSinceDonation,
      };
    });

    // Filter to only show available donors
    const availableDonors = enrichedDonors.filter((donor) => donor.isAvailable);

    return NextResponse.json(availableDonors);
  } catch (error) {
    console.error("Donor list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donors" },
      { status: 500 }
    );
  }
}
