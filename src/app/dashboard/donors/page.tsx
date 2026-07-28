"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { DonorCard } from "@/components/ui/donor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

type Donor = {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: string;
  address?: string | null;
  isAvailable: boolean;
  isBaseEligible?: boolean;
  isAvailabilityOptedIn?: boolean;
  lastDonationDate: string | null;
  distanceKm?: number;
};

type DonorManagementResponse = {
  allRegisteredDonors: Donor[];
  nearbyAvailableDonors: Donor[];
};

export default function HospitalDonorsManager() {
  const [allRegisteredDonors, setAllRegisteredDonors] = useState<Donor[]>([]);
  const [nearbyAvailableDonors, setNearbyAvailableDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospital/donors?view=management")
      .then((r) => r.json())
      .then((data: DonorManagementResponse) => {
        setAllRegisteredDonors(data.allRegisteredDonors ?? []);
        setNearbyAvailableDonors(data.nearbyAvailableDonors ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell role="hospital">
      <PageHeader
        title="Registered Donors"
        subtitle="Review registered donors and nearby opted-in donors without changing their availability"
      />

      {loading ? (
        <LoadingState count={4} />
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A]">All Registered Donors</h2>
                <p className="text-sm text-[#64748B]">Hospital-affiliated donors, with computed availability shown read-only.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-[#475569]">
                {allRegisteredDonors.length} donor{allRegisteredDonors.length !== 1 ? "s" : ""}
              </span>
            </div>
            {allRegisteredDonors.length === 0 ? (
              <EmptyState
                title="No registered donors"
                description="Donors can affiliate with your hospital through their profile settings."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {allRegisteredDonors.map((donor, i) => (
                  <DonorCard key={donor.id} {...donor} index={i} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A]">Opted-In & Available Nearby</h2>
                <p className="text-sm text-[#64748B]">Eligible opted-in donors within 50 km, sorted by distance.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-[#475569]">
                {nearbyAvailableDonors.length} donor{nearbyAvailableDonors.length !== 1 ? "s" : ""}
              </span>
            </div>
            {nearbyAvailableDonors.length === 0 ? (
              <EmptyState
                title="No nearby available donors"
                description="No opted-in eligible donors are currently within 50 km."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {nearbyAvailableDonors.map((donor, i) => (
                  <DonorCard key={donor.id} {...donor} index={i} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
