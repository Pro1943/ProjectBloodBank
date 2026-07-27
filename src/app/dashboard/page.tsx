import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { syncCampStatuses } from "@/lib/maintenance";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HospitalDashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  const hospital = await db.hospital.findUnique({ where: { clerkUserId: user.id } });
  if (!hospital) return null;

  await syncCampStatuses();

  const [requestCount, campCount, donorCount, criticalCount] = await Promise.all([
    db.bloodRequest.count({ where: { hospitalId: hospital.id, status: { in: ["OPEN", "PARTIALLY_FILLED"] } } }),
    db.donationCamp.count({
      where: {
        hospitalId: hospital.id,
        status: { in: ["UPCOMING", "ACTIVE"] },
        endDate: { gte: new Date() },
      },
    }),
    db.donor.count({ where: { hospitalAffiliationId: hospital.id } }),
    db.bloodRequest.count({ where: { hospitalId: hospital.id, urgency: "CRITICAL", status: { in: ["OPEN", "PARTIALLY_FILLED"] } } }),
  ]);

  const recentRequests = await db.bloodRequest.findMany({
    where: { hospitalId: hospital.id, status: { in: ["OPEN", "PARTIALLY_FILLED"] } },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    take: 5,
    include: { hospital: { select: { name: true } } },
  });

  return (
    <AppShell role="hospital">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Hospital Dashboard</h1>
          <p className="mt-1 text-sm text-[#64748B]">Operational overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/requests"
            className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B]"
          >
            + New request
          </Link>
          <Link
            href="/dashboard/camps"
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0369A1] transition-colors hover:border-[#0369A1]"
          >
            + Schedule camp
          </Link>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-[#FEF2F2] px-5 py-4">
          <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-[#B91C1C]" />
          <p className="text-sm font-semibold text-[#B91C1C]">
            {criticalCount} CRITICAL request{criticalCount !== 1 ? "s" : ""} require immediate attention
          </p>
          <Link href="/dashboard/requests" className="ml-auto text-sm font-semibold text-[#B91C1C] underline underline-offset-2 hover:opacity-75">
            View →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open requests"
          value={<AnimatedCounter target={requestCount} />}
          icon={<span className="text-lg">🩸</span>}
          accent="red"
          index={0}
        />
        <StatCard
          label="Upcoming camps"
          value={<AnimatedCounter target={campCount} />}
          icon={<span className="text-lg">📍</span>}
          accent="blue"
          index={1}
        />
        <StatCard
          label="Registered donors"
          value={<AnimatedCounter target={donorCount} />}
          icon={<span className="text-lg">👥</span>}
          accent="teal"
          index={2}
        />
      </div>

      {recentRequests.length > 0 && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F172A]">Recent open requests</h2>
            <Link href="/dashboard/requests" className="text-sm font-semibold text-[#0369A1] hover:opacity-75">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentRequests.map((req) => {
              const urgencyStyles = {
                CRITICAL: "text-[#B91C1C] bg-red-50",
                URGENT: "text-[#B45309] bg-amber-50",
                STANDARD: "text-[#0369A1] bg-[#E0F2FE]",
              };
              const pct = Math.min((req.unitsFulfilled / req.unitsNeeded) * 100, 100);
              return (
                <div key={req.id} className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${urgencyStyles[req.urgency as keyof typeof urgencyStyles]}`}>
                    {req.bloodType.replace("_", "")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#0369A1]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-[#64748B] shrink-0">{req.unitsFulfilled}/{req.unitsNeeded} units</span>
                  <span className={`text-xs font-semibold shrink-0 ${urgencyStyles[req.urgency as keyof typeof urgencyStyles]} rounded px-1.5 py-0.5`}>
                    {req.urgency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
