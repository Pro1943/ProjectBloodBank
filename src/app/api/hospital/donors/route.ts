import { getDonorAvailability } from "@/lib/availability";
import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/distance";
import { cleanupOldCompletedData } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const NEARBY_RADIUS_KM = 50;

export async function GET(request: NextRequest) {
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

    const donorSelect = {
      id: true,
      firstName: true,
      lastName: true,
      bloodType: true,
      address: true,
      latitude: true,
      longitude: true,
      hospitalAffiliationId: true,
      isAvailabilityOptedIn: true,
      lastDonationDate: true,
    };

    const donors = await db.donor.findMany({
      orderBy: { lastName: "asc" },
      select: donorSelect,
    });

    const hospitalLocation = { latitude: hospital.latitude, longitude: hospital.longitude };
    const donorsWithAvailability = donors.map((donor) => ({
      ...donor,
      ...getDonorAvailability(donor),
    }));

    const nearbyDonors = donorsWithAvailability
      .map((donor) => {
        const distanceKm = calculateDistance(hospitalLocation, {
          latitude: donor.latitude,
          longitude: donor.longitude,
        });

        return {
          ...donor,
          canDonate: donor.isAvailable,
          distanceKm,
        };
      })
      .filter((donor) => donor.isAvailable && donor.distanceKm <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const view = request.nextUrl.searchParams.get("view");
    if (view === "management") {
      const allRegisteredDonors = donorsWithAvailability
        .filter((donor) => donor.hospitalAffiliationId === hospital.id)
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

      return NextResponse.json({
        allRegisteredDonors,
        nearbyAvailableDonors: nearbyDonors,
      });
    }

    return NextResponse.json(nearbyDonors);
  } catch (error) {
    console.error("Hospital donor fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 });
  }
}
