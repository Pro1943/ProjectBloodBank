"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { COUNTRIES, validatePhoneNumberByCode } from "@/lib/countries";

type Hospital = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  phoneCountryCode: string;
  countryLocation: string;
  email: string;
};

export default function HospitalProfilePage() {
  const [formData, setFormData] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    fetch("/api/hospitals/profile")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setFormData(data))
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
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
      const res = await fetch("/api/hospitals/profile", {
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

  if (loading) return <AppShell role="hospital"><LoadingState count={2} /></AppShell>;
  if (!formData) return <AppShell role="hospital"><ErrorState message={error || "Profile not found"} /></AppShell>;

  return (
    <AppShell role="hospital">
      <PageHeader title="Hospital Profile" subtitle="Manage your hospital's contact and location details" />

      {error && <ErrorState message={error} />}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-[#0D9488]"
        >
          ✓ {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#0F172A]">Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hospital name">
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Email">
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#0F172A]">Location</h2>
          <FormField label="Address">
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Latitude">
              <input required type="number" step="0.0001" value={Number.isFinite(formData.latitude) ? formData.latitude : ""} onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : Number.NaN })} className={inputClass} placeholder="e.g. 28.6139" />
            </FormField>
            <FormField label="Longitude">
              <input required type="number" step="0.0001" value={Number.isFinite(formData.longitude) ? formData.longitude : ""} onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : Number.NaN })} className={inputClass} placeholder="e.g. 77.2090" />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#0F172A]">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Country">
              <select value={formData.countryLocation} onChange={(e) => setFormData({ ...formData, countryLocation: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Phone code">
              <select value={formData.phoneCountryCode} onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.phoneCode}>{c.phoneCode} {c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Phone number" error={phoneError}>
              <input type="tel" value={formData.phone} onChange={(e) => handlePhoneChange(e.target.value)} className={`${inputClass} ${phoneError ? "border-[#B91C1C]" : ""}`} />
            </FormField>
          </div>
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
