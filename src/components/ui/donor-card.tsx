"use client";

import { motion } from "framer-motion";
import { BloodTypeBadge } from "./blood-type-badge";

type DonorCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: string;
  address?: string | null;
  isAvailable: boolean;
  lastDonationDate: string | null;
  isUpdating?: boolean;
  onToggleAvailability?: (id: string, current: boolean) => void;
  index?: number;
};

export function DonorCard({
  id,
  firstName,
  lastName,
  bloodType,
  address,
  isAvailable,
  lastDonationDate,
  isUpdating,
  onToggleAvailability,
  index = 0,
}: DonorCardProps) {
  const lastDonationLabel = lastDonationDate
    ? new Date(lastDonationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Never";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#64748B]">
            {firstName[0]}{lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-[#0F172A]">{firstName} {lastName}</p>
            <p className="text-xs text-[#64748B]">{address ?? "Address not provided"}</p>
            <p className="mt-0.5 text-xs text-[#94A3B8]">Last donation: {lastDonationLabel}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <BloodTypeBadge bloodType={bloodType} size="sm" />
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isAvailable ? "bg-teal-100 text-[#0D9488]" : "bg-red-100 text-[#B91C1C]"}`}>
            {isAvailable ? "Available" : "Paused"}
          </span>
        </div>
      </div>

      {onToggleAvailability && (
        <div className="mt-4 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={isUpdating}
            onClick={() => onToggleAvailability(id, isAvailable)}
            className="rounded-lg border border-[#E2E8F0] px-4 py-1.5 text-sm font-semibold text-[#0369A1] transition-colors hover:bg-[#E0F2FE] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating…" : isAvailable ? "Pause donor" : "Mark available"}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
