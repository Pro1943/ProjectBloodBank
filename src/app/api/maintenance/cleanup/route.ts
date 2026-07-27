import { cleanupOldCompletedData } from "@/lib/maintenance";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await cleanupOldCompletedData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scheduled cleanup error:", error);
    return NextResponse.json({ error: "Failed to run cleanup" }, { status: 500 });
  }
}
