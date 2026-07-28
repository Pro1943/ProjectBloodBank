import { db } from "@/lib/db";
import { getDonorAvailability } from "@/lib/availability";
import { checkBloodCompatibility } from "@/lib/blood-compatibility";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contributions = await db.bloodDonorContribution.findMany({
      where: { requestId: id },
      include: { donor: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Contribution fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Find the request (any hospital can contribute to a request)
    const bloodRequest = await db.bloodRequest.findUnique({ where: { id } });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const unitsContributed = parseInt(body.unitsContributed);
    if (!Number.isInteger(unitsContributed) || unitsContributed <= 0) {
      return NextResponse.json(
        { error: "Units contributed must be a positive number" },
        { status: 400 }
      );
    }

    const remainingUnits = bloodRequest.unitsNeeded - bloodRequest.unitsFulfilled;

    // Validate that we don't exceed remaining needed units
    if (unitsContributed > remainingUnits) {
      return NextResponse.json(
        { error: `Cannot contribute more than ${remainingUnits} remaining units (${remainingUnits * 450} ml)` },
        { status: 400 }
      );
    }

    const donor = await db.donor.findUnique({ where: { id: body.donorId } });
    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    if (!checkBloodCompatibility(donor.bloodType, bloodRequest.bloodType)) {
      return NextResponse.json({ error: "Donor blood type is not compatible with this request" }, { status: 400 });
    }

    const availability = getDonorAvailability(donor);
    if (!availability.isAvailable) {
      return NextResponse.json({ error: "Donor is not currently eligible and opted in for donation" }, { status: 400 });
    }

    const existingContribution = await db.bloodDonorContribution.findUnique({
      where: {
        requestId_donorId: {
          requestId: id,
          donorId: body.donorId,
        },
      },
    });

    const contribution = existingContribution
      ? await db.bloodDonorContribution.update({
          where: {
            requestId_donorId: {
              requestId: id,
              donorId: body.donorId,
            },
          },
          data: {
            unitsContributed: existingContribution.unitsContributed + unitsContributed,
          },
          include: { donor: true },
        })
      : await db.bloodDonorContribution.create({
          data: {
            requestId: id,
            donorId: body.donorId,
            unitsContributed,
          },
          include: { donor: true },
        });

    // Hospitals can log a witnessed donation event; availability is computed from this date.
    await db.donor.update({
      where: { id: body.donorId },
      data: {
        lastDonationDate: new Date(),
      },
    });

    // Recalculate total fulfilled units
    const totalUnits = await db.bloodDonorContribution.aggregate({
      where: { requestId: id },
      _sum: { unitsContributed: true },
    });

    const newUnitsFulfilled = totalUnits._sum.unitsContributed || 0;
    const newStatus =
      newUnitsFulfilled >= bloodRequest.unitsNeeded
        ? "FULFILLED"
        : newUnitsFulfilled > 0
        ? "PARTIALLY_FILLED"
        : "OPEN";

    // Always update unitsFulfilled. System will auto-mark FULFILLED when enough units are collected.
    await db.bloodRequest.update({
      where: { id },
      data: {
        unitsFulfilled: newUnitsFulfilled,
        status: newStatus,
      },
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Contribution creation error:", error);
    return NextResponse.json(
      { error: "Failed to add contribution" },
      { status: 500 }
    );
  }
}
