import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { calculateDistance } from "@/lib/distance";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Parse optional radiusKm param
    const url = new URL(request.url);
    const radiusParam = url.searchParams.get("radiusKm");
    const NEARBY_RADIUS_KM = radiusParam ? parseFloat(radiusParam) : 50;

    // Determine whether the current user is a hospital or donor
    const hospitalUser = await db.hospital.findUnique({ where: { clerkUserId: user.id } });
    const donor = await db.donor.findUnique({ where: { clerkUserId: user.id } });

    if (!hospitalUser && !donor) {
      return NextResponse.json({ error: "User not found as donor or hospital" }, { status: 404 });
    }

    // Get all open requests (include limited hospital contact info)
    const allRequests = await db.bloodRequest.findMany({
      where: { status: "OPEN" },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            phone: true,
            phoneCountryCode: true,
            email: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    // Use base location from hospital (if hospital user) or donor
    const baseLocation = hospitalUser
      ? { latitude: hospitalUser.latitude, longitude: hospitalUser.longitude }
      : donor
      ? { latitude: donor.latitude, longitude: donor.longitude }
      : null;

    let nearbyRequests = allRequests;
    if (baseLocation && baseLocation.latitude && baseLocation.longitude) {
      nearbyRequests = allRequests.filter((req) => {
        const hosp = req.hospital;
        if (!hosp || !hosp.latitude || !hosp.longitude) return false;
        const distance = calculateDistance(
          { latitude: baseLocation.latitude!, longitude: baseLocation.longitude! },
          { latitude: hosp.latitude, longitude: hosp.longitude }
        );
        return distance <= NEARBY_RADIUS_KM;
      });
    }

    // Sort by urgency and date
    const urgencyOrder = { CRITICAL: 0, URGENT: 1, STANDARD: 2 };
    nearbyRequests.sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      if (urgencyDiff !== 0) return urgencyDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Include hospital details with requests
    return NextResponse.json(nearbyRequests);
  } catch (error) {
    console.error("Nearby requests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby requests" },
      { status: 500 }
    );
  }
}
