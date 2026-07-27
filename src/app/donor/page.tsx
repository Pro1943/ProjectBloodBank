import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CooldownIndicator } from "@/components/ui/cooldown-indicator";
import { db } from "@/lib/db";
import { checkBloodCompatibility } from "@/lib/blood-compatibility";
import { calculateDistance } from "@/lib/distance";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

const COOLDOWN_DAYS = 90;

export default async function DonorDashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  const donor = await db.donor.findUnique({
    where: { clerkUserId: user.id },
    include: { campRSVPs: true, hospitalAffiliation: true },
  });

  const requests = await db.bloodRequest.findMany({
    where: { status: { in: ["OPEN", "PARTIALLY_FILLED"] } },
    include: {
      hospital: {
        select: {
          latitude: true,
          longitude: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const baseLocation = donor?.latitude && donor?.longitude
    ? { latitude: donor.latitude, longitude: donor.longitude }
    : donor?.hospitalAffiliation?.latitude && donor?.hospitalAffiliation?.longitude
    ? { latitude: donor.hospitalAffiliation.latitude, longitude: donor.hospitalAffiliation.longitude }
    : null;

  const nearbyRequests = baseLocation
    ? requests.filter((req) => {
        if (!req.hospital?.latitude || !req.hospital?.longitude) return false;
        return calculateDistance(baseLocation, {
          latitude: req.hospital.latitude,
          longitude: req.hospital.longitude,
        }) <= 50;
      })
    : [];

  const compatibleCount = donor
    ? nearbyRequests.filter((r) => checkBloodCompatibility(donor.bloodType, r.bloodType)).length
    : 0;

  const camps = await db.donationCamp.findMany({
    where: {
      status: { in: ["UPCOMING", "ACTIVE"] },
      endDate: { gte: new Date() },
    },
  });

  let daysSinceDonation: number | null = null;
  let inCooldown = false;

  if (donor?.lastDonationDate) {
    daysSinceDonation = Math.floor(
      (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    inCooldown = daysSinceDonation < COOLDOWN_DAYS;
  }

  const canDonate = (donor?.isAvailable ?? true) && !inCooldown;

  const lastDonationLabel = donor?.lastDonationDate
    ? new Date(donor.lastDonationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Never";

  return (
    <AppShell role="donor">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Donor Dashboard</h1>
          <p className="mt-1 text-sm text-[#64748B]">Your coordination hub</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/donor/requests" className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B]">
            Find requests
          </Link>
          <Link href="/donor/camps" className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0369A1] transition-colors hover:border-[#0369A1]">
            Browse camps
          </Link>
        </div>
      </div>

      <CooldownIndicator
        canDonate={canDonate}
        daysSinceDonation={daysSinceDonation}
        lastDonationLabel={lastDonationLabel}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Compatible requests"
          value={<AnimatedCounter target={compatibleCount} />}
          icon={<span className="text-lg">🩸</span>}
          accent="red"
          index={0}
        />
        <StatCard
          label="Your blood type"
          value={donor?.bloodType?.replace("_", "") ?? "—"}
          icon={<span className="text-lg">🔬</span>}
          accent="blue"
          index={1}
        />
        <StatCard
          label="Upcoming camps"
          value={<AnimatedCounter target={camps.length} />}
          icon={<span className="text-lg">📍</span>}
          accent="teal"
          index={2}
        />
      </div>
    </AppShell>
  );
}
