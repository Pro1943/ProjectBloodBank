import Link from "next/link";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const HeaderClient = dynamic(() => import("@/components/header-client"));

type AppShellProps = {
  children: ReactNode;
  role: "hospital" | "donor";
};

const hospitalLinks = [
  { href: "/dashboard", label: "Overview", icon: "⊞" },
  { href: "/dashboard/requests", label: "Requests", icon: "🩸" },
  { href: "/dashboard/donors", label: "Donors", icon: "👥" },
  { href: "/dashboard/camps", label: "Camps", icon: "📍" },
  { href: "/dashboard/profile", label: "Profile", icon: "🏥" },
];

const donorLinks = [
  { href: "/donor", label: "Overview", icon: "⊞" },
  { href: "/donor/requests", label: "Requests", icon: "🩸" },
  { href: "/donor/camps", label: "Camps", icon: "📍" },
  { href: "/donor/profile", label: "Profile", icon: "👤" },
];

export function AppShell({ children, role }: AppShellProps) {
  const links = role === "hospital" ? hospitalLinks : donorLinks;
  const roleLabel = role === "hospital" ? "Hospital" : "Donor";
  const roleBadgeClass = role === "hospital"
    ? "bg-red-50 text-[#B91C1C] border-red-100"
    : "bg-[#E0F2FE] text-[#0369A1] border-blue-100";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[#E2E8F0] bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B91C1C]">
            <span className="text-xs font-bold text-white">BB</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Blood Bank</p>
            <span className={`inline-block rounded border px-1.5 py-px text-[10px] font-semibold ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white/90 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#B91C1C]">
              <span className="text-xs font-bold text-white">BB</span>
            </div>
            <span className="text-sm font-bold text-[#0F172A]">Blood Bank</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto lg:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:border-[#0369A1] hover:text-[#0369A1]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block" />
          <HeaderClient />
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
