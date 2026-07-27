"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CampCard } from "@/components/ui/camp-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getEffectiveCampStatus } from "@/lib/camp-status";

type Camp = {
  id: string;
  title: string;
  description?: string | null;
  address: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  rsvpCount: number;
  collectedUnits?: number;
  status: string;
  isRegistered?: boolean;
};

export default function DonorCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [registering, setRegistering] = useState<string[]>([]);

  const loadCamps = useCallback(() => {
    return fetch("/api/camps")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCamps(data);
        }
      });
  }, []);

  useEffect(() => {
    loadCamps().finally(() => setLoading(false));
  }, [loadCamps]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      void loadCamps();
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadCamps]);

  const handleRegister = async (campId: string) => {
    setRegistering((prev) => [...prev, campId]);
    try {
      const response = await fetch("/api/camps/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to register");

      setCamps((prev) =>
        prev.map((camp) =>
          camp.id === campId
            ? { ...camp, isRegistered: true, rsvpCount: camp.rsvpCount + 1 }
            : camp
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to register for the camp");
    } finally {
      setRegistering((prev) => prev.filter((id) => id !== campId));
    }
  };

  if (loading) {
    return (
      <AppShell role="donor">
        <PageHeader title="Donation Camps" subtitle="Find upcoming blood drives near you" />
        <LoadingState count={3} />
      </AppShell>
    );
  }

  return (
    <AppShell role="donor">
      <PageHeader title="Donation Camps" subtitle="Find upcoming blood drives near you" />

      {camps.length === 0 ? (
        <EmptyState
          title="No upcoming camps"
          description="No donation camps are scheduled right now. Check back soon — new camps are added regularly."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {camps.map((camp, i) => {
            const isRegistered = camp.isRegistered ?? false;
            const { status } = getEffectiveCampStatus(camp.startDate, camp.endDate, camp.status, now);

            return (
              <CampCard
                key={camp.id}
                title={camp.title}
                address={camp.address}
                description={camp.description}
                startDate={camp.startDate}
                endDate={camp.endDate}
                maxCapacity={camp.maxCapacity}
                rsvpCount={camp.rsvpCount}
                collectedUnits={camp.collectedUnits}
                status={status}
                index={i}
                action={
                  isRegistered ? (
                    <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-[#0D9488]">
                      Registered
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegister(camp.id)}
                      disabled={registering.includes(camp.id)}
                      className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {registering.includes(camp.id) ? "Registering…" : "Register"}
                    </button>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
