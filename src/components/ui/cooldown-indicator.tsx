"use client";

import { motion } from "framer-motion";

type CooldownIndicatorProps = {
  canDonate: boolean;
  daysSinceDonation: number | null;
  lastDonationLabel: string;
};

const COOLDOWN_DAYS = 90;

export function CooldownIndicator({ canDonate, daysSinceDonation, lastDonationLabel }: CooldownIndicatorProps) {
  const progress = daysSinceDonation !== null
    ? Math.min(daysSinceDonation / COOLDOWN_DAYS, 1)
    : 1;

  const daysRemaining = daysSinceDonation !== null
    ? Math.max(COOLDOWN_DAYS - daysSinceDonation, 0)
    : 0;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const strokeColor = canDonate ? "#0D9488" : "#D97706";

  return (
    <div className={`rounded-xl border p-6 ${canDonate ? "border-teal-200 bg-teal-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
            <motion.circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              transform="rotate(-90 44 44)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">{canDonate ? "✓" : "⏳"}</span>
          </div>
        </div>
        <div>
          <p className={`text-sm font-semibold ${canDonate ? "text-[#0D9488]" : "text-[#B45309]"}`}>
            {canDonate ? "Ready to donate" : "Donation cooldown active"}
          </p>
          <p className="mt-1 text-sm text-[#64748B]">Last donation: {lastDonationLabel}</p>
          {!canDonate && daysSinceDonation !== null && (
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
