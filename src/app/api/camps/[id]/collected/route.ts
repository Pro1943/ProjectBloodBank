import { db } from "@/lib/db";
import { syncCampStatuses } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await syncCampStatuses();

    const { id } = await params;
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const body = await request.json();
    const collectedUnits = parseInt(body.collectedUnits, 10);

    if (Number.isNaN(collectedUnits) || collectedUnits < 0) {
      return NextResponse.json({ error: "Collected units must be a non-negative number" }, { status: 400 });
    }

    const camp = await db.donationCamp.findUnique({ where: { id } });

    if (!camp || camp.hospitalId !== hospital.id) {
      return NextResponse.json({ error: "Camp not found or access denied" }, { status: 404 });
    }



    const updatedCamp = await db.donationCamp.update({
      where: { id },
      data: {
        collectedUnits,
      },
    });

    return NextResponse.json(updatedCamp);
  } catch (error) {
    console.error("Update camp collected units error:", error);
    return NextResponse.json({ error: "Failed to update collected units" }, { status: 500 });
  }
}
