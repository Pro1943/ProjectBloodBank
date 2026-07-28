import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkBloodCompatibility } from "@/lib/blood-compatibility";
import { calculateDistance } from "@/lib/distance";

const NEARBY_RADIUS_KM = 50;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalUser = await db.hospital.findUnique({ where: { clerkUserId: user.id } });
    const donor = await db.donor.findUnique({ where: { clerkUserId: user.id } });

    if (!hospitalUser && !donor) {
      return NextResponse.json({ error: "User not found as donor or hospital" }, { status: 404 });
    }

    const allRequests = await db.bloodRequest.findMany({
      where: { status: { in: ["OPEN", "PARTIALLY_FILLED"] } },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            phoneCountryCode: true,
            email: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    const baseLocation = hospitalUser
      ? { latitude: hospitalUser.latitude, longitude: hospitalUser.longitude }
      : donor
      ? { latitude: donor.latitude, longitude: donor.longitude }
      : null;

    const nearbyRequests = baseLocation
      ? allRequests
          .map((req) => {
            const hosp = req.hospital;
            const distanceKm = calculateDistance(baseLocation, {
              latitude: hosp.latitude,
              longitude: hosp.longitude,
            });

            return {
              ...req,
              distanceKm,
            };
          })
          .filter((req) => {
            if (req.distanceKm > NEARBY_RADIUS_KM) return false;
            return donor ? checkBloodCompatibility(donor.bloodType, req.bloodType) : true;
          })
      : [];

    nearbyRequests.sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(nearbyRequests, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Nearby requests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby requests" },
      { status: 500 }
    );
  }
}
