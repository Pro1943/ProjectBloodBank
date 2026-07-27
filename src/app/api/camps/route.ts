import { db } from "@/lib/db";
import { syncCampStatuses } from "@/lib/maintenance";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type CampItem = {
  id: string;
  hospitalId: string;
  title: string;
  description?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  startDate: Date;
  endDate: Date;
  maxCapacity: number;
  collectedUnits?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  rsvps: { status: string }[];
};

export async function GET(request: Request) {
  try {
    await syncCampStatuses();

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({
      where: { clerkUserId: user.id },
    });

    if (hospital) {
      const camps = await db.donationCamp.findMany({
        where: { hospitalId: hospital.id },
        orderBy: { startDate: "asc" },
        include: { rsvps: { where: { status: "CONFIRMED" } } },
      }) as unknown as CampItem[];

      return NextResponse.json(
        camps.map((camp: CampItem) => ({
          ...camp,
          rsvpCount: camp.rsvps.length,
        }))
      );
    }

    const donor = await db.donor.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!donor) {
      return NextResponse.json(
        { error: "Donor profile not found" },
        { status: 404 }
      );
    }

    const camps = await db.donationCamp.findMany({
      where: {
        status: { in: ["UPCOMING", "ACTIVE"] },
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      include: { rsvps: { where: { status: "CONFIRMED" } } },
    }) as unknown as CampItem[];

    const registered = await db.campRSVP.findMany({
      where: {
        donorId: donor.id,
        campId: { in: camps.map((camp: CampItem) => camp.id) },
      },
      select: { campId: true },
    });

    const registeredCampIds = new Set(registered.map((item: { campId: string }) => item.campId));

    return NextResponse.json(
      camps.map((camp: CampItem) => ({
        ...camp,
        rsvpCount: camp.rsvps.length,
        isRegistered: registeredCampIds.has(camp.id),
      }))
    );
  } catch (error) {
    console.error("Camp fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch camps" },
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

    if (!body.title || !body.address || !body.startDate || !body.endDate || !body.maxCapacity) {
      return NextResponse.json(
        { error: "Title, address, start date, end date, and max capacity are all required." },
        { status: 400 }
      );
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const maxCapacity = parseInt(body.maxCapacity, 10);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Start date and end date must be valid date/time values." },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after the start date." },
        { status: 400 }
      );
    }

    if (Number.isNaN(maxCapacity) || maxCapacity <= 0) {
      return NextResponse.json(
        { error: "Max capacity must be a positive number." },
        { status: 400 }
      );
    }

    const camp = await db.donationCamp.create({
      data: {
        hospitalId: hospital.id,
        title: body.title,
        description: body.description ?? "",
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        startDate,
        endDate,
        maxCapacity,
      },
    });

    return NextResponse.json(camp, { status: 201 });
  } catch (error) {
    console.error("Camp creation error:", error);
    return NextResponse.json(
      { error: "Failed to create camp" },
      { status: 500 }
    );
  }
}
