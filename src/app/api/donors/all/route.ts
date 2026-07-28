import { db } from "@/lib/db";
import { getDonorAvailability } from "@/lib/availability";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const donors = await db.donor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bloodType: true,
        isAvailabilityOptedIn: true,
        lastDonationDate: true,
      },
      orderBy: { lastName: "asc" },
    });

    const enrichedDonors = donors.map((donor) => {
      const availability = getDonorAvailability(donor);

      return {
        ...donor,
        ...availability,
        canDonate: availability.isAvailable,
      };
    });

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
