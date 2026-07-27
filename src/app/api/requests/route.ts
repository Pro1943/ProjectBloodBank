import { db } from "@/lib/db";
import { cleanupOldCompletedData } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await cleanupOldCompletedData();

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    const requests = await db.bloodRequest.findMany({
      where: { hospitalId: hospital.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Request fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const bloodRequest = await db.bloodRequest.create({
      data: {
        hospitalId: hospital.id,
        bloodType: body.bloodType,
        unitsNeeded: parseInt(body.unitsNeeded),
        urgency: body.urgency,
        notes: body.notes,
      },
    });

    return NextResponse.json(bloodRequest, { status: 201 });
  } catch (error) {
    console.error("Request creation error:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
