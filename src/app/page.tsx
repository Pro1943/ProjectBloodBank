import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { LandingContent } from "@/components/landing-content";

const features = [
  {
    icon: "🩸",
    title: "Emergency coordination",
    description: "Hospitals publish urgent blood needs and track fulfillment in real time.",
  },
  {
    icon: "👥",
    title: "Donor matching",
    description: "Donors are matched to compatible requests based on blood type and proximity.",
  },
  {
    icon: "📍",
    title: "Donation camps",
    description: "Hospitals schedule blood drives and donors RSVP with one click.",
  },
];

export default async function HomePage() {
  const user = await currentUser();

  if (user) {
    const hospital = await db.hospital.findUnique({ where: { clerkUserId: user.id } });
    if (hospital) return redirect("/dashboard");
    const donor = await db.donor.findUnique({ where: { clerkUserId: user.id } });
    if (donor) return redirect("/donor");
    return redirect("/onboarding");
  }

  const donorCount = await db.donor.count();
  const requestCount = await db.bloodRequest.count({ where: { status: "FULFILLED" } });
  const campCount = await db.donationCamp.count();

  const stats = [
    { label: "Donors registered", value: donorCount, accent: "text-[#B91C1C]" },
    { label: "Requests fulfilled", value: requestCount, accent: "text-[#0D9488]" },
    { label: "Camps hosted", value: campCount, accent: "text-[#0369A1]" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <header className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B91C1C]">
            <span className="text-xs font-bold text-white">BB</span>
          </div>
          <span className="text-sm font-bold text-[#0F172A]">Project Blood Bank</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B]"
          >
            Get started
          </Link>
        </div>
      </header>

      <LandingContent stats={stats} features={features} />

      <footer className="border-t border-[#E2E8F0] bg-white px-6 py-6 text-center text-xs text-[#94A3B8]">
        © {new Date().getFullYear()} Project Blood Bank — Emergency Blood Coordination Platform
      </footer>
    </main>
  );
}
