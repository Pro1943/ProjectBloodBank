"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { ErrorState } from "@/components/ui/error-state";
import { COUNTRIES, validatePhoneNumberByCode } from "@/lib/countries";

const BLOOD_TYPES = ["O_NEG", "O_POS", "A_NEG", "A_POS", "B_NEG", "B_POS", "AB_NEG", "AB_POS"];

type Hospital = { id: string; name: string };

export default function DonorOnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", bloodType: "", address: "",
    latitude: "", longitude: "", phone: "", phoneCountryCode: "+1",
    countryLocation: "United States", email: "", hospitalAffiliationId: "",
    registerUnderHospital: false,
  });

  useEffect(() => {
    fetch("/api/hospitals")
      .then((r) => r.ok ? r.json() : [])
      .then(setHospitals)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    const phoneValidation = validatePhoneNumberByCode(formData.phone, formData.phoneCountryCode);
    if (!phoneValidation.valid) {
      setError(phoneValidation.error || "Invalid phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bloodType: formData.bloodType,
          address: formData.address || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          phone: formData.phone,
          phoneCountryCode: formData.phoneCountryCode,
          countryLocation: formData.countryLocation,
          email: formData.email,
          clerkUserId: user.id,
          hospitalAffiliationId: formData.registerUnderHospital ? formData.hospitalAffiliationId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create donor profile");
      router.push("/donor");
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
          <span className="inline-block rounded-full border border-[#E0F2FE] bg-[#E0F2FE] px-3 py-1 text-xs font-semibold text-[#0369A1]">
            Step 2 of 2 · Donor
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[#0F172A]">Your donor profile</h1>
        <p className="mt-1 mb-6 text-sm text-[#64748B]">Share your blood type and location so hospitals can reach you when help is needed.</p>

        {error && <div className="mb-4"><ErrorState message={error} /></div>}

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name">
              <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} placeholder="First name" />
            </FormField>
            <FormField label="Last name">
              <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} placeholder="Last name" />
            </FormField>
          </div>

          <FormField label="Blood type">
            <select required value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className={selectClass}>
              <option value="">Select your blood type</option>
              {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", "")}</option>)}
            </select>
          </FormField>

          <FormField label="Country">
            <select required value={formData.countryLocation} onChange={(e) => setFormData({ ...formData, countryLocation: e.target.value })} className={selectClass}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="Address (optional)">
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="Street address" />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Latitude (optional)" hint="Helps match nearby requests">
              <input type="number" step="0.0001" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className={inputClass} placeholder="e.g. 23.8103" />
            </FormField>
            <FormField label="Longitude (optional)">
              <input type="number" step="0.0001" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className={inputClass} placeholder="e.g. 90.4125" />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone code">
              <select required value={formData.phoneCountryCode} onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })} className={selectClass}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.phoneCode}>{c.name} ({c.phoneCode})</option>)}
              </select>
            </FormField>
            <FormField label="Phone number">
              <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="Phone number" />
            </FormField>
          </div>

          <FormField label="Email">
            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="donor@email.com" />
          </FormField>

          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.registerUnderHospital}
                onChange={(e) => setFormData({ ...formData, registerUnderHospital: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#0369A1]"
              />
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Affiliate with a hospital</p>
                <p className="text-xs text-[#64748B]">Allows hospital staff to assign you to blood requests</p>
              </div>
            </label>
            <AnimatePresence>
              {formData.registerUnderHospital && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-[#0F172A] mb-1.5">Select hospital</label>
                    <select value={formData.hospitalAffiliationId} onChange={(e) => setFormData({ ...formData, hospitalAffiliationId: e.target.value })} className={selectClass}>
                      <option value="">Choose a hospital</option>
                      {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0369A1] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#075985] disabled:opacity-50"
            >
              {loading ? "Creating your profile…" : "Continue to donor dashboard →"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
