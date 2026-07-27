import { db } from "@/lib/db";

export const COMPLETED_CLEANUP_DAYS = 30;

export async function cleanupOldCompletedData() {
  const thresholdDate = new Date(Date.now() - COMPLETED_CLEANUP_DAYS * 24 * 60 * 60 * 1000);

  const deletedRequests = await db.bloodRequest.deleteMany({
    where: {
      status: { in: ["FULFILLED", "COMPLETED"] },
      updatedAt: { lt: thresholdDate },
    },
  });

  const deletedCamps = await db.donationCamp.deleteMany({
    where: {
      status: { in: ["COMPLETED", "FULFILLED"] },
      updatedAt: { lt: thresholdDate },
    },
  });

  await db.donationCamp.updateMany({
    where: {
      endDate: { lt: new Date() },
      status: { not: "COMPLETED" },
    },
    data: { status: "COMPLETED" },
  });

  return {
    deletedRequests: deletedRequests.count,
    deletedCamps: deletedCamps.count,
    thresholdDate: thresholdDate.toISOString(),
  };
}
