import { db } from "@/lib/db";
import { getEffectiveCampStatus } from "@/lib/camp-status";
import { syncCampStatuses } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await syncCampStatuses();

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const campId = body.campId;

    if (!campId) {
      return NextResponse.json({ error: "Camp ID is required" }, { status: 400 });
    }

    const camp = await db.donationCamp.findUnique({ where: { id: campId } });
    if (!camp) {
      return NextResponse.json({ error: "Camp not found" }, { status: 404 });
    }

    const { status } = getEffectiveCampStatus(camp.startDate, camp.endDate, camp.status);

    if (status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot register for a completed camp" }, { status: 400 });
    }

    const donor = await db.donor.findUnique({ where: { clerkUserId: user.id } });
    if (!donor) {
      return NextResponse.json({ error: "Only donors can register themselves for camps" }, { status: 403 });
    }

    const donorId = donor.id;

    const existingRsvp = await db.campRSVP.findUnique({
      where: {
        campId_donorId: {
          campId,
          donorId,
        },
      },
    });

    if (existingRsvp) {
      return NextResponse.json({ error: "Donor is already registered for this camp" }, { status: 409 });
    }



    const newRsvp = await db.campRSVP.create({
      data: {
        campId,
        donorId,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(newRsvp, { status: 201 });
  } catch (error) {
    console.error("Camp RSVP error:", error);
    return NextResponse.json({ error: "Failed to register for camp" }, { status: 500 });
  }
}
