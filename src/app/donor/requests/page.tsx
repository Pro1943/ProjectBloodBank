"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { RequestCard } from "@/components/ui/request-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { checkBloodCompatibility } from "@/lib/blood-compatibility";

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

type ContactInfo = { hospitalName: string; email: string; phone: string } | null;

export default function DonorRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [nearbyRequests, setNearbyRequests] = useState<BloodRequest[]>([]);
  const [donorBloodType, setDonorBloodType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(null);
  const [activeTab, setActiveTab] = useState<"compatible" | "nearby">("compatible");

  useEffect(() => {
    async function fetchData() {
      try {
        const [donorRes, reqRes, nearbyRes] = await Promise.all([
          fetch("/api/donors/profile"),
          fetch("/api/requests"),
          fetch("/api/requests/nearby"),
        ]);
        if (donorRes.ok) setDonorBloodType((await donorRes.json()).bloodType);
        if (reqRes.ok) setRequests(await reqRes.json());
        if (nearbyRes.ok) setNearbyRequests(await nearbyRes.json());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const compatibleRequests = requests.filter((r) =>
    donorBloodType ? checkBloodCompatibility(donorBloodType, r.bloodType) : false
  );

  const compatibleNearby = nearbyRequests.filter((r) =>
    donorBloodType ? checkBloodCompatibility(donorBloodType, r.bloodType) : false
  );

  const activeList = activeTab === "compatible" ? compatibleRequests : compatibleNearby;

  return (
    <AppShell role="donor">
      <PageHeader
        title="Emergency Requests"
        subtitle={donorBloodType ? `Showing requests compatible with your blood type ${donorBloodType.replace("_", "")}` : "Loading your compatible requests…"}
      />

      <div className="flex gap-1.5">
        {(["compatible", "nearby"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === tab ? "bg-[#0F172A] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]"
            }`}
          >
            {tab === "compatible" ? "My hospital" : "Nearby hospitals"}
            {tab === "compatible" && compatibleRequests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-[#B91C1C] px-1.5 py-px text-xs text-white">
                {compatibleRequests.length}
              </span>
            )}
            {tab === "nearby" && compatibleNearby.length > 0 && (
              <span className="ml-1.5 rounded-full bg-[#0369A1] px-1.5 py-px text-xs text-white">
                {compatibleNearby.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState count={3} />
      ) : activeList.length === 0 ? (
        <EmptyState
          title="No matching requests"
          description={
            activeTab === "compatible"
              ? "No open requests match your blood type at your hospital right now."
              : "No compatible requests from hospitals within 50 km of your location."
          }
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
              expandedContent={
                activeTab === "nearby" ? (
                  <div>
                    <p className="text-sm text-[#64748B] mb-3">{request.hospital.address}</p>
                    <button
                      onClick={() => setContactInfo({ hospitalName: request.hospital.name, email: request.hospital.email, phone: request.hospital.phone })}
                      className="rounded-lg bg-[#0369A1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075985]"
                    >
                      Contact hospital →
                    </button>
                  </div>
                ) : undefined
              }
              onExpandToggle={activeTab === "nearby" ? () => {} : undefined}
            />
          ))}
        </div>
      )}

      <Modal open={!!contactInfo} onClose={() => setContactInfo(null)} title="Contact Hospital">
        {contactInfo && (
          <div className="space-y-4">
            <p className="font-semibold text-[#0F172A]">{contactInfo.hospitalName}</p>
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
