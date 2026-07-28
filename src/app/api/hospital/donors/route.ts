import { getDonorAvailability } from "@/lib/availability";
import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/distance";
import { cleanupOldCompletedData } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const NEARBY_RADIUS_KM = 50;

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
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bloodType: true,
        address: true,
        latitude: true,
        longitude: true,
        isAvailabilityOptedIn: true,
        lastDonationDate: true,
      },
    });

    const hospitalLocation = { latitude: hospital.latitude, longitude: hospital.longitude };
    const nearbyDonors = donors
      .map((donor) => {
        const availability = getDonorAvailability(donor);
        const distanceKm = calculateDistance(hospitalLocation, {
          latitude: donor.latitude,
          longitude: donor.longitude,
        });

        return {
          ...donor,
          ...availability,
          canDonate: availability.isAvailable,
          distanceKm,
        };
      })
      .filter((donor) => donor.isAvailable && donor.distanceKm <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(nearbyDonors);
  } catch (error) {
    console.error("Hospital donor fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 });
  }
}
