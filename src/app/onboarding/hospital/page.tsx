"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { ErrorState } from "@/components/ui/error-state";
import { COUNTRIES, validatePhoneNumberByCode } from "@/lib/countries";

export default function HospitalOnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "", address: "", latitude: "", longitude: "",
    phone: "", phoneCountryCode: "+1", countryLocation: "United States", email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    const phoneValidation = validatePhoneNumberByCode(formData.phone, formData.phoneCountryCode);
    if (!phoneValidation.valid) {
      setError(phoneValidation.error || "Invalid phone number");
      return;
    }
    if (!formData.latitude || !formData.longitude || !Number.isFinite(Number(formData.latitude)) || !Number.isFinite(Number(formData.longitude))) {
      setError("Latitude and longitude are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: user.id,
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          phone: formData.phone,
          phoneCountryCode: formData.phoneCountryCode,
          countryLocation: formData.countryLocation,
          email: formData.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create hospital");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B91C1C]">
            <span className="text-xs font-bold text-white">BB</span>
          </div>
          <span className="text-sm font-bold text-[#0F172A]">Project Blood Bank</span>
        </div>
        <div className="mt-6 mb-2">
          <span className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-[#B91C1C]">
            Step 2 of 2 · Hospital
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[#0F172A]">Hospital details</h1>
        <p className="mt-1 mb-6 text-sm text-[#64748B]">This information helps donors and coordinators locate your facility.</p>

        {error && <div className="mb-4"><ErrorState message={error} /></div>}

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label="Hospital name">
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. City General Hospital" />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Address">
                <input required type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="Street address" />
              </FormField>
            </div>
            <FormField label="Latitude" hint="For locating nearby donors">
              <input required type="number" step="0.0001" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className={inputClass} placeholder="e.g. 28.6139" />
            </FormField>
            <FormField label="Longitude">
              <input required type="number" step="0.0001" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className={inputClass} placeholder="e.g. 77.2090" />
            </FormField>
            <FormField label="Country">
              <select required value={formData.countryLocation} onChange={(e) => setFormData({ ...formData, countryLocation: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Email">
              <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="contact@hospital.org" />
            </FormField>
            <FormField label="Phone code">
              <select required value={formData.phoneCountryCode} onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.phoneCode}>{c.name} ({c.phoneCode})</option>)}
              </select>
            </FormField>
            <FormField label="Phone number">
              <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="Phone number" />
            </FormField>
          </div>

          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#B91C1C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B] disabled:opacity-50"
            >
              {loading ? "Creating your workspace…" : "Continue to dashboard →"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
