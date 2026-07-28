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
  lastDonationDate: string | null;
  distanceKm?: number;
};

export default function HospitalDonorsManager() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospital/donors")
      .then((r) => r.json())
      .then(setDonors)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell role="hospital">
      <PageHeader
        title="Registered Donors"
        subtitle={donors.length > 0 ? `${donors.length} nearby available donor${donors.length !== 1 ? "s" : ""} within 50 km` : "Nearby available compatible donors appear here"}
      />

      {loading ? (
        <LoadingState count={4} />
      ) : donors.length === 0 ? (
        <EmptyState
          title="No affiliated donors"
          description="No opted-in eligible donors are currently within 50 km."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {donors.map((donor, i) => (
            <DonorCard
              key={donor.id}
              {...donor}
              index={i}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
