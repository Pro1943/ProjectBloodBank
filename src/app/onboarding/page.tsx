import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B91C1C]">
            <span className="text-xs font-bold text-white">BB</span>
          </div>
          <span className="text-sm font-bold text-[#0F172A]">Project Blood Bank</span>
        </div>
        <div className="mt-8 mb-10 text-center">
          <span className="inline-block rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-semibold text-[#64748B]">
            Step 1 of 2
          </span>
          <h1 className="mt-4 text-3xl font-bold text-[#0F172A]">Choose your role</h1>
          <p className="mt-2 text-[#64748B]">How will you use Project Blood Bank?</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/onboarding/hospital"
            className="group rounded-xl border-2 border-[#E2E8F0] bg-white p-7 shadow-sm transition-all hover:border-[#B91C1C] hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl transition-colors group-hover:bg-red-100">
              🏥
            </div>
            <p className="mt-5 text-lg font-bold text-[#0F172A]">Hospital admin</p>
            <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
              Post emergency blood requests, manage donation camps, and coordinate with affiliated donors.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#B91C1C] opacity-0 transition-opacity group-hover:opacity-100">
              Get started <span>→</span>
            </div>
          </Link>

          <Link
            href="/onboarding/donor"
            className="group rounded-xl border-2 border-[#E2E8F0] bg-white p-7 shadow-sm transition-all hover:border-[#0369A1] hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E0F2FE] text-2xl transition-colors group-hover:bg-blue-100">
              🩸
            </div>
            <p className="mt-5 text-lg font-bold text-[#0F172A]">Blood donor</p>
            <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
              Browse emergency requests compatible with your blood type, find donation camps near you.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0369A1] opacity-0 transition-opacity group-hover:opacity-100">
              Get started <span>→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
