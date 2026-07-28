"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { COUNTRIES, validatePhoneNumberByCode } from "@/lib/countries";

const BLOOD_TYPES = ["O_NEG", "O_POS", "A_NEG", "A_POS", "B_NEG", "B_POS", "AB_NEG", "AB_POS"];

type Donor = {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: string;
  phone: string;
  phoneCountryCode: string;
  countryLocation: string;
  address: string | null;
  latitude: number;
  longitude: number;
  hospitalAffiliationId: string | null;
  isAvailabilityOptedIn: boolean;
  isBaseEligible: boolean;
};

type Hospital = { id: string; name: string };

export default function DonorProfilePage() {
  const [formData, setFormData] = useState<Donor | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, hospitalsRes] = await Promise.all([
          fetch("/api/donors/profile"),
          fetch("/api/hospitals"),
        ]);
        if (!profileRes.ok) throw new Error();
        setFormData(await profileRes.json());
        if (hospitalsRes.ok) setHospitals(await hospitalsRes.json());
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => prev ? { ...prev, phone: value } : null);
    if (value && formData?.phoneCountryCode) {
      const result = validatePhoneNumberByCode(value, formData.phoneCountryCode);
      setPhoneError(result.error || "");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (formData.phone) {
      const result = validatePhoneNumberByCode(formData.phone, formData.phoneCountryCode);
      if (!result.valid) { setPhoneError(result.error || "Invalid phone number"); return; }
    }
    if (!Number.isFinite(formData.latitude) || !Number.isFinite(formData.longitude)) {
      setError("Latitude and longitude are required.");
      return;
    }
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch("/api/donors/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setFormData(await res.json());
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppShell role="donor"><LoadingState count={2} /></AppShell>;
  if (!formData) return <AppShell role="donor"><ErrorState message={error || "Profile not found"} /></AppShell>;

  return (
    <AppShell role="donor">
      <PageHeader title="Your Profile" subtitle="Manage your donor details and hospital affiliation" />

      {error && <ErrorState message={error} />}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-[#0D9488]"
        >
          ✓ {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">Identity</h2>
            {formData.bloodType && <BloodTypeBadge bloodType={formData.bloodType} size="md" />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name">
              <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Last name">
              <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} />
            </FormField>
          </div>
          <FormField label="Blood type">
            <select required value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className={selectClass}>
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", "")}</option>)}
            </select>
          </FormField>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#0F172A]">Location</h2>
          <FormField label="Address (optional)">
            <input type="text" value={formData.address ?? ""} onChange={(e) => setFormData({ ...formData, address: e.target.value || null })} className={inputClass} placeholder="Your address" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Latitude" hint="Used to find nearby requests">
              <input required type="number" step="0.0001" value={Number.isFinite(formData.latitude) ? formData.latitude : ""} onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : Number.NaN })} className={inputClass} placeholder="e.g. 28.6139" />
            </FormField>
            <FormField label="Longitude" hint="Used to find nearby requests">
              <input required type="number" step="0.0001" value={Number.isFinite(formData.longitude) ? formData.longitude : ""} onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : Number.NaN })} className={inputClass} placeholder="e.g. 77.2090" />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-[#0F172A]">Availability</h2>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={formData.isAvailabilityOptedIn}
              disabled={!formData.isBaseEligible}
              onChange={(e) => setFormData({ ...formData, isAvailabilityOptedIn: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#0369A1] disabled:opacity-50"
            />
            <div>
              <p className="text-sm font-medium text-[#0F172A]">
                {formData.isBaseEligible ? "Available for matching" : "Donation cooldown active"}
              </p>
              <p className="text-xs text-[#64748B]">
                {formData.isBaseEligible
                  ? "Turn this off when you are eligible but temporarily unavailable."
                  : "You cannot opt in again until the 56-day cooldown has passed."}
              </p>
            </div>
          </label>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#0F172A]">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Country">
              <select required value={formData.countryLocation} onChange={(e) => setFormData({ ...formData, countryLocation: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Phone code">
              <select required value={formData.phoneCountryCode} onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.phoneCode}>{c.phoneCode} {c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Phone number" error={phoneError}>
              <input required type="tel" value={formData.phone} onChange={(e) => handlePhoneChange(e.target.value)} className={`${inputClass} ${phoneError ? "border-[#B91C1C]" : ""}`} />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">Hospital affiliation</h2>
            {formData.hospitalAffiliationId && (
              <button type="button" onClick={() => setFormData({ ...formData, hospitalAffiliationId: null })} className="text-xs font-medium text-[#B91C1C] hover:opacity-75">
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-[#64748B]">Affiliating with a hospital helps their team find you in nearby donor matching.</p>
          <select value={formData.hospitalAffiliationId ?? ""} onChange={(e) => setFormData({ ...formData, hospitalAffiliationId: e.target.value || null })} className={selectClass}>
            <option value="">Not affiliated</option>
            {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0369A1] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#075985] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </motion.button>
        </div>
      </form>
    </AppShell>
  );
}
