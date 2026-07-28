"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { RequestCard } from "@/components/ui/request-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { AnimatePresence, motion } from "framer-motion";
import { getCompatibleDonorTypes } from "@/lib/blood-compatibility";

type BloodRequest = {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: "CRITICAL" | "URGENT" | "STANDARD";
  status: string;
  notes?: string;
};

type Donor = {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: string;
  isAvailable?: boolean;
  canDonate?: boolean;
};

type Contribution = {
  id: string;
  donorId: string;
  unitsContributed: number;
  donor: { firstName: string; lastName: string };
};

const BLOOD_TYPES = ["O_NEG", "O_POS", "A_NEG", "A_POS", "B_NEG", "B_POS", "AB_NEG", "AB_POS"];

export default function HospitalRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [contributions, setContributions] = useState<Record<string, Contribution[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contributionForm, setContributionForm] = useState({ donorId: "", units: "" });
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CRITICAL" | "URGENT" | "STANDARD">("ALL");
  const [formData, setFormData] = useState({ bloodType: "", unitsNeeded: "", urgency: "URGENT", notes: "" });

  useEffect(() => {
    async function fetchData() {
      try {
        const [reqRes, donorRes] = await Promise.all([fetch("/api/requests"), fetch("/api/hospital/donors")]);
        setRequests(await reqRes.json());
        setDonors(await donorRes.json());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getCompatibleDonors = (bloodType: string) =>
    donors.filter((d) => getCompatibleDonorTypes(bloodType).includes(d.bloodType) && d.isAvailable !== false);

  const fetchContributions = async (id: string) => {
    const res = await fetch(`/api/requests/${id}/contributions`);
    const data = await res.json();
    setContributions((prev) => ({ ...prev, [id]: data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setRequests([created, ...requests]);
      setFormData({ bloodType: "", unitsNeeded: "", urgency: "URGENT", notes: "" });
      setShowForm(false);
    } catch {
      alert("Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddContribution = async (requestId: string, e: React.FormEvent) => {
    e.preventDefault();
    const request = requests.find((r) => r.id === requestId);
    if (!request || !contributionForm.donorId || !contributionForm.units) return;
    const units = parseInt(contributionForm.units);
    const remaining = request.unitsNeeded - request.unitsFulfilled;
    if (units > remaining) {
      alert(`Cannot exceed ${remaining} remaining units`);
      return;
    }
    try {
      const res = await fetch(`/api/requests/${requestId}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId: contributionForm.donorId, unitsContributed: units }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await fetchContributions(requestId);
      const updatedReqs = await fetch("/api/requests").then((r) => r.json());
      setRequests(updatedReqs);
      setContributionForm({ donorId: "", units: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add contribution");
    }
  };

  const filteredRequests = requests.filter(
    (r) => activeFilter === "ALL" || r.urgency === activeFilter
  );

  const filterTabs: Array<"ALL" | "CRITICAL" | "URGENT" | "STANDARD"> = ["ALL", "CRITICAL", "URGENT", "STANDARD"];

  return (
    <AppShell role="hospital">
      <PageHeader
        title="Emergency Requests"
        subtitle="Post and track blood requests for your hospital"
        action={
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              showForm
                ? "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]"
                : "bg-[#B91C1C] text-white hover:bg-[#991B1B]"
            }`}
          >
            {showForm ? "Cancel" : "+ New request"}
          </motion.button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-[#0F172A]">Post emergency request</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Blood type">
                  <select
                    required
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select blood type</option>
                    {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", "")}</option>)}
                  </select>
                </FormField>
                <FormField label="Units needed" hint="1 unit = 450 ml">
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.unitsNeeded}
                    onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 5"
                  />
                </FormField>
              </div>
              <FormField label="Urgency level">
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className={selectClass}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </FormField>
              <FormField label="Notes (optional)">
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Any additional context..."
                />
              </FormField>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#B91C1C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B] disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create request"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === tab
                ? "bg-[#0F172A] text-white"
                : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]"
            }`}
          >
            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState count={3} />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={activeFilter === "ALL" ? "Create your first emergency request to get started." : `No ${activeFilter.toLowerCase()} requests right now.`}
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request, i) => {
            const isExpanded = expandedId === request.id;
            const requestContributions = contributions[request.id] ?? [];
            const compatibleDonors = getCompatibleDonors(request.bloodType);
            const isFulfilled = request.unitsFulfilled >= request.unitsNeeded;

            return (
              <RequestCard
                key={request.id}
                id={request.id}
                bloodType={request.bloodType}
                urgency={request.urgency}
                status={request.status}
                unitsNeeded={request.unitsNeeded}
                unitsFulfilled={request.unitsFulfilled}
                notes={request.notes}
                index={i}
                isExpanded={isExpanded}
                onExpandToggle={!isFulfilled ? () => {
                  setExpandedId(isExpanded ? null : request.id);
                  if (!isExpanded && !contributions[request.id]) fetchContributions(request.id);
                } : undefined}
                expandedContent={
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-[#64748B] mb-2">
                        Remaining: {request.unitsNeeded - request.unitsFulfilled} units ({(request.unitsNeeded - request.unitsFulfilled) * 450} ml)
                      </p>
                      {compatibleDonors.length === 0 ? (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-[#B91C1C]">
                          No eligible donors with compatible blood type within 50 km. Donors may be in the 56-day donation cooldown or opted out.
                        </p>
                      ) : (
                        <form onSubmit={(e) => handleAddContribution(request.id, e)} className="flex flex-wrap gap-2 items-end">
                          <div className="flex-1 min-w-44">
                            <label className="block text-xs font-medium text-[#0F172A] mb-1">Select donor</label>
                            <select
                              value={contributionForm.donorId}
                              onChange={(e) => setContributionForm({ ...contributionForm, donorId: e.target.value })}
                              className={selectClass}
                            >
                              <option value="">Choose donor…</option>
                              {compatibleDonors.map((d) => (
                                <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.bloodType.replace("_", "")})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#0F172A] mb-1">Units (450ml each)</label>
                            <input
                              type="number"
                              min="1"
                              max={request.unitsNeeded - request.unitsFulfilled}
                              value={contributionForm.units}
                              onChange={(e) => setContributionForm({ ...contributionForm, units: e.target.value })}
                              className={`w-24 ${inputClass}`}
                              placeholder="Units"
                            />
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className="rounded-lg bg-[#0369A1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#075985]"
                          >
                            Log
                          </motion.button>
                        </form>
                      )}
                    </div>
                    {requestContributions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A] mb-2">Contributors</p>
                        <div className="space-y-1.5">
                          {requestContributions.map((c) => (
                            <div key={c.id} className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm">
                              <span className="text-[#0F172A]">{c.donor.firstName} {c.donor.lastName}</span>
                              <span className="font-semibold text-[#0369A1]">{c.unitsContributed} units ({c.unitsContributed * 450} ml)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
