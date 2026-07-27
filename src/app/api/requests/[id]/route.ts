import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const req = await db.bloodRequest.findUnique({ where: { id }, include: { hospital: { select: { id: true, name: true, phone: true, phoneCountryCode: true, email: true } } } });
    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    return NextResponse.json(req);
  } catch (error) {
    console.error("Request fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospital = await db.hospital.findUnique({ where: { clerkUserId: user.id } });
    if (!hospital) return NextResponse.json({ error: "Only hospitals may update request status" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const bloodRequest = await db.bloodRequest.findUnique({ where: { id } });
    if (!bloodRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (bloodRequest.hospitalId !== hospital.id) {
      return NextResponse.json({ error: "Forbidden: only the requesting hospital can update this request" }, { status: 403 });
    }

    const allowedFields: any = {};
    if (body.status !== undefined) allowedFields.status = body.status;
    if (body.notes !== undefined) allowedFields.notes = body.notes;
    if (body.unitsNeeded !== undefined) allowedFields.unitsNeeded = parseInt(body.unitsNeeded, 10);

    const updated = await db.bloodRequest.update({ where: { id }, data: allowedFields });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Request update error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
