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
};

export default function HospitalDonorsManager() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/hospital/donors")
      .then((r) => r.json())
      .then(setDonors)
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (id: string, current: boolean) => {
    setUpdatingIds((prev) => [...prev, id]);
    try {
      const res = await fetch("/api/hospital/donors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId: id, isAvailable: !current }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setDonors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <AppShell role="hospital">
      <PageHeader
        title="Registered Donors"
        subtitle={donors.length > 0 ? `${donors.length} affiliated donor${donors.length !== 1 ? "s" : ""}` : "Manage availability for your hospital-affiliated donors"}
      />

      {loading ? (
        <LoadingState count={4} />
      ) : donors.length === 0 ? (
        <EmptyState
          title="No affiliated donors"
          description="Donors can affiliate with your hospital through their profile settings."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {donors.map((donor, i) => (
            <DonorCard
              key={donor.id}
              {...donor}
              isUpdating={updatingIds.includes(donor.id)}
              onToggleAvailability={toggleAvailability}
              index={i}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
