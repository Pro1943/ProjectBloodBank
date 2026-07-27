"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BloodTypeBadge } from "./blood-type-badge";
import { UrgencyBadge } from "./urgency-badge";
import { ProgressBar } from "./progress-bar";
import type { ReactNode } from "react";

type RequestCardProps = {
  id: string;
  bloodType: string;
  urgency: "CRITICAL" | "URGENT" | "STANDARD";
  status: string;
  unitsNeeded: number;
  unitsFulfilled: number;
  notes?: string | null;
  hospitalName?: string;
  createdAt?: string;
  index?: number;
  isExpanded?: boolean;
  onExpandToggle?: () => void;
  expandedContent?: ReactNode;
};

const urgencyCardStyles = {
  CRITICAL: {
    border: "border-red-200",
    bg: "bg-[#FEF2F2]",
    leftBar: "bg-[#B91C1C] animate-pulse-red",
  },
  URGENT: {
    border: "border-amber-200",
    bg: "bg-[#FFFBEB]",
    leftBar: "bg-[#D97706]",
  },
  STANDARD: {
    border: "border-[#E2E8F0]",
    bg: "bg-white",
    leftBar: "bg-[#0369A1]",
  },
};

export function RequestCard({
  id,
  bloodType,
  urgency,
  status,
  unitsNeeded,
  unitsFulfilled,
  notes,
  hospitalName,
  createdAt,
  index = 0,
  isExpanded,
  onExpandToggle,
  expandedContent,
}: RequestCardProps) {
  const styles = urgencyCardStyles[urgency];
  const isFulfilled = unitsFulfilled >= unitsNeeded;
  const isExpandable = !!onExpandToggle && !isFulfilled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={!isFulfilled ? { y: -1, transition: { duration: 0.15 } } : {}}
      className={`overflow-hidden rounded-xl border shadow-sm ${styles.border} ${styles.bg}`}
    >
      <div className="flex">
        <div className={`w-1 shrink-0 ${styles.leftBar}`} />
        <div className="flex-1 p-5">
          <div
            className={`flex flex-wrap items-start gap-3 ${isExpandable ? "cursor-pointer" : ""}`}
            onClick={isExpandable ? onExpandToggle : undefined}
          >
            <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
              <BloodTypeBadge bloodType={bloodType} size="lg" />
              <div className="min-w-0">
                {hospitalName && (
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{hospitalName}</p>
                )}
                {createdAt && (
                  <p className="text-xs text-[#94A3B8]">
                    {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <UrgencyBadge urgency={urgency} />
              {isFulfilled ? (
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-[#0D9488]">
                  ✓ Fulfilled
                </span>
              ) : (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  status === "PARTIALLY_FILLED"
                    ? "bg-amber-100 text-[#B45309]"
                    : "bg-[#E0F2FE] text-[#0369A1]"
                }`}>
                  {status === "PARTIALLY_FILLED" ? "Partial" : "Open"}
                </span>
              )}
              {isExpandable && (
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  className="text-[#94A3B8] text-sm"
                >
                  ▶
                </motion.span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar fulfilled={unitsFulfilled} needed={unitsNeeded} />
          </div>

          {notes && <p className="mt-3 text-sm text-[#64748B] italic">{notes}</p>}

          <AnimatePresence>
            {isExpanded && expandedContent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-5 border-t border-[#E2E8F0] pt-5">
                  {expandedContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
