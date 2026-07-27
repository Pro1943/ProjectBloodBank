"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CampCard } from "@/components/ui/camp-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { getEffectiveCampStatus } from "@/lib/camp-status";

type Camp = {
  id: string;
  title: string;
  description?: string | null;
  address: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  status: string;
  collectedUnits?: number;
  rsvpCount: number;
};

export default function HospitalCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [collectedValue, setCollectedValue] = useState("");
  const [savingCollected, setSavingCollected] = useState<string[]>([]);
  const [hospitalDonors, setHospitalDonors] = useState<{ id: string; firstName: string; lastName: string; }[]>([]);
  const [selectedDonorId, setSelectedDonorId] = useState<string>("");
  const [registeringDonors, setRegisteringDonors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "", description: "", address: "", latitude: "", longitude: "",
    startDate: "", endDate: "", maxCapacity: "",
  });

  const loadCamps = useCallback(() => {
    return fetch("/api/camps", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCamps(data);
        }
      });
  }, []);

  useEffect(() => {
    loadCamps().finally(() => setLoading(false));

    fetch("/api/hospital/donors", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const availableDonors = data.filter((d: { isAvailable?: boolean }) => d.isAvailable !== false);
          setHospitalDonors(availableDonors);
          if (availableDonors.length > 0) {
            setSelectedDonorId(availableDonors[0].id);
          }
        }
      });
  }, [loadCamps]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      void loadCamps();
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadCamps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/camps", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCamps([{
        ...data,
        rsvpCount: 0,
      }, ...camps]);
      setFormData({ title: "", description: "", address: "", latitude: "", longitude: "", startDate: "", endDate: "", maxCapacity: "" });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create camp");
    } finally {
      setSubmitting(false);
    }
  };

  const nowTime = now.getTime();
  const upcomingCamps = camps.filter((camp) => new Date(camp.endDate).getTime() >= nowTime);
  const pastCamps = camps.filter((camp) => new Date(camp.endDate).getTime() < nowTime);

  const handleSaveCollected = async (campId: string) => {
    setSavingCollected((prev) => [...prev, campId]);
    try {
      const response = await fetch(`/api/camps/${campId}/collected`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectedUnits: collectedValue }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update collected units");

      setCamps((prev) => prev.map((camp) => (camp.id === campId ? { ...camp, collectedUnits: data.collectedUnits } : camp)));
      setEditingCampId(null);
      setCollectedValue("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to save collected units");
    } finally {
      setSavingCollected((prev) => prev.filter((id) => id !== campId));
    }
  };

  const handleAddAffiliatedDonor = async (campId: string) => {
    if (!selectedDonorId) {
      alert("Select a donor first.");
      return;
    }

    setRegisteringDonors((prev) => [...prev, campId]);
    try {
      const response = await fetch("/api/camps/rsvp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campId, donorId: selectedDonorId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add donor to camp");

      setCamps((prev) => prev.map((camp) => (camp.id === campId ? { ...camp, rsvpCount: camp.rsvpCount + 1 } : camp)));
      alert("Donor added to camp successfully.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to add donor");
    } finally {
      setRegisteringDonors((prev) => prev.filter((id) => id !== campId));
    }
  };

  return (
    <AppShell role="hospital">
      <PageHeader
        title="Donation Camps"
        subtitle="Schedule and manage blood donation drives"
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
            {showForm ? "Cancel" : "+ Schedule camp"}
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
            <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Schedule a camp</h2>
              <FormField label="Camp title">
                <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Community Blood Drive" />
              </FormField>
              <FormField label="Description (optional)">
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} rows={2} placeholder="Details about the camp" />
              </FormField>
              <FormField label="Address">
                <input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="Camp location" />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Latitude (optional)">
                  <input type="number" step="0.0001" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className={inputClass} placeholder="e.g. 28.6139" />
                </FormField>
                <FormField label="Longitude (optional)">
                  <input type="number" step="0.0001" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className={inputClass} placeholder="e.g. 77.2090" />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Start date & time">
                  <input required type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="End date & time">
                  <input required type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className={inputClass} />
                </FormField>
              </div>
              <FormField label="Minimum blood collection target (1 unit = 450ml)">
                <input required type="number" min="1" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })} className={inputClass} placeholder="e.g. 50" />
              </FormField>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#B91C1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create camp"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingState count={3} />
      ) : camps.length === 0 ? (
        <EmptyState
          title="No camps scheduled"
          description="Organize your first blood donation drive to engage your donor community."
        />
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A]">Upcoming Camps</h2>
                <p className="text-sm text-[#64748B]">Manage active and future donation drives.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-[#475569]">{upcomingCamps.length} camp{upcomingCamps.length !== 1 ? "s" : ""}</span>
            </div>
            {upcomingCamps.length === 0 ? (
              <EmptyState title="No upcoming camps" description="Schedule a new blood drive to get started." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingCamps.map((camp, i) => {
                  const { status, isPast } = getEffectiveCampStatus(camp.startDate, camp.endDate, camp.status, now);

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
                    isPast={isPast}
                    index={i}
                    action={
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCampId(camp.id);
                            setCollectedValue(String(camp.collectedUnits ?? 0));
                          }}
                          className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B]"
                        >
                          Update collected units
                        </button>
                        {editingCampId === camp.id && (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              value={collectedValue}
                              onChange={(e) => setCollectedValue(e.target.value)}
                              type="number"
                              min="0"
                              className={inputClass}
                              placeholder="Collected units"
                            />
                            <button
                              type="button"
                              disabled={savingCollected.includes(camp.id)}
                              onClick={() => handleSaveCollected(camp.id)}
                              className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingCollected.includes(camp.id) ? "Saving…" : "Save"}
                            </button>
                          </div>
                        )}
                        {hospitalDonors.length > 0 && (
                          <div className="grid gap-2">
                            <select
                              value={selectedDonorId}
                              onChange={(e) => setSelectedDonorId(e.target.value)}
                              className={selectClass}
                            >
                              {hospitalDonors.map((donor) => (
                                <option key={donor.id} value={donor.id}>
                                  {donor.firstName} {donor.lastName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={registeringDonors.includes(camp.id)}
                              onClick={() => handleAddAffiliatedDonor(camp.id)}
                              className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {registeringDonors.includes(camp.id) ? "Adding…" : "Add affiliated donor"}
                            </button>
                          </div>
                        )}
                      </div>
                    }
                  />
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A]">Past Camps</h2>
                <p className="text-sm text-[#64748B]">Review completed drives and log collected blood after the event.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-[#475569]">{pastCamps.length} camp{pastCamps.length !== 1 ? "s" : ""}</span>
            </div>
            {pastCamps.length === 0 ? (
              <EmptyState title="No past camps yet" description="Past camps will appear here after they end." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pastCamps.map((camp, i) => {
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
                    isPast
                    index={i}
                    action={
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCampId(camp.id);
                            setCollectedValue(String(camp.collectedUnits ?? 0));
                          }}
                          className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B]"
                        >
                          Update collected units
                        </button>
                        {editingCampId === camp.id && (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              value={collectedValue}
                              onChange={(e) => setCollectedValue(e.target.value)}
                              type="number"
                              min="0"
                              className={inputClass}
                              placeholder="Collected units"
                            />
                            <button
                              type="button"
                              disabled={savingCollected.includes(camp.id)}
                              onClick={() => handleSaveCollected(camp.id)}
                              className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingCollected.includes(camp.id) ? "Saving…" : "Save"}
                            </button>
                          </div>
                        )}
                      </div>
                    }
                  />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
