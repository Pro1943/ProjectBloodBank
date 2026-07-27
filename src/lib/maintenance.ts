import { db } from "@/lib/db";

export const COMPLETED_CLEANUP_DAYS = 30;

export async function syncCampStatuses() {
  const now = new Date();

  const activated = await db.donationCamp.updateMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
      status: "UPCOMING",
    },
    data: { status: "ACTIVE" },
  });

  const completed = await db.donationCamp.updateMany({
    where: {
      endDate: { lt: now },
      status: { not: "COMPLETED" },
    },
    data: { status: "COMPLETED" },
  });

  return {
    activatedCount: activated.count,
    completedCount: completed.count,
  };
}

export async function cleanupOldCompletedData() {
  await syncCampStatuses();

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

  return {
    deletedRequests: deletedRequests.count,
    deletedCamps: deletedCamps.count,
    thresholdDate: thresholdDate.toISOString(),
  };
}
