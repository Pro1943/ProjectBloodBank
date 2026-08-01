"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { RequestCard } from "@/components/ui/request-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";

type BloodRequest = {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: "CRITICAL" | "URGENT" | "STANDARD";
  status: string;
  notes?: string;
  createdAt: string;
  hospital: { id: string; name: string; email: string; phone: string; address: string; latitude: number; longitude: number };
};

type ContactInfo = { hospitalName: string; address: string; email: string; phone: string } | null;

export default function DonorRequestsPage() {
  const [nearbyRequests, setNearbyRequests] = useState<BloodRequest[]>([]);
  const [donorBloodType, setDonorBloodType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactInfo, setContactInfo] = useState<ContactInfo>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [donorRes, nearbyRes] = await Promise.all([
          fetch("/api/donors/profile", { cache: "no-store" }),
          fetch("/api/requests/nearby", { cache: "no-store" }),
        ]);
        if (donorRes.ok) setDonorBloodType((await donorRes.json()).bloodType);
        if (!nearbyRes.ok) {
          const data = await nearbyRes.json().catch(() => null);
          throw new Error(data?.error || "Failed to load nearby requests");
        }
        setNearbyRequests(await nearbyRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load nearby requests");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeList = nearbyRequests;

  return (
    <AppShell role="donor">
      <PageHeader
        title="Emergency Requests"
        subtitle={donorBloodType ? `Showing requests compatible with your blood type ${donorBloodType.replace("_", "")}` : "Loading your compatible requests…"}
      />

      <div className="flex gap-1.5">
        <span className="rounded-full bg-[#0F172A] px-4 py-1.5 text-sm font-semibold text-white">
          Nearby hospitals
          {nearbyRequests.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#0369A1] px-1.5 py-px text-xs text-white">
              {nearbyRequests.length}
            </span>
          )}
        </span>
      </div>

      {error ? (
        <EmptyState title="Unable to load nearby requests" description={error} />
      ) : loading ? (
        <LoadingState count={3} />
      ) : activeList.length === 0 ? (
        <EmptyState
          title="No matching requests"
          description="No compatible requests from hospitals within 50 km of your location."
        />
      ) : (
        <div className="space-y-3">
          {activeList.map((request, i) => (
            <RequestCard
              key={request.id}
              id={request.id}
              bloodType={request.bloodType}
              urgency={request.urgency}
              status={request.status}
              unitsNeeded={request.unitsNeeded}
              unitsFulfilled={request.unitsFulfilled}
              notes={request.notes}
              hospitalName={request.hospital.name}
              createdAt={request.createdAt}
              index={i}
              onCardClick={() =>
                setContactInfo({
                  hospitalName: request.hospital.name,
                  address: request.hospital.address,
                  email: request.hospital.email,
                  phone: request.hospital.phone,
                })
              }
            />
          ))}
        </div>
      )}

      <Modal open={!!contactInfo} onClose={() => setContactInfo(null)} title="Contact Hospital">
        {contactInfo && (
          <div className="space-y-4">
            <p className="font-semibold text-[#0F172A]">{contactInfo.hospitalName}</p>
            <p className="text-sm text-[#64748B] break-words">{contactInfo.address}</p>
            <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#94A3B8] mb-1">Email</p>
                <a href={`mailto:${contactInfo.email}`} className="text-sm text-[#0369A1] hover:underline break-all">{contactInfo.email}</a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[#94A3B8] mb-1">Phone</p>
                <a href={`tel:${contactInfo.phone}`} className="text-sm text-[#0369A1] hover:underline">{contactInfo.phone}</a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
