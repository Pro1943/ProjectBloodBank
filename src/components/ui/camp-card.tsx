"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type CampCardProps = {
  title: string;
  address: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  rsvpCount: number;
  collectedUnits?: number;
  status: string;
  action?: ReactNode;
  isPast?: boolean;
  index?: number;
};

const statusConfig: Record<string, { label: string; classes: string }> = {
  UPCOMING: { label: "Upcoming", classes: "bg-[#E0F2FE] text-[#0369A1]" },
  ACTIVE: { label: "Active", classes: "bg-teal-100 text-[#0D9488]" },
  COMPLETED: { label: "Completed", classes: "bg-slate-100 text-[#64748B]" },
};

export function CampCard({
  title,
  address,
  description,
  startDate,
  endDate,
  maxCapacity,
  rsvpCount,
  collectedUnits,
  status,
  action,
  isPast,
  index = 0,
}: CampCardProps) {
  const collected = collectedUnits ?? 0;
  const rawPct = maxCapacity > 0 ? (collected / maxCapacity) * 100 : 0;
  const barWidth = Math.min(rawPct, 100);
  const goalReached = collected >= maxCapacity && maxCapacity > 0;
  const progressColor = goalReached ? "bg-[#16A34A]" : "bg-[#0369A1]";
  const statusCfg = isPast ? { label: "Finished", classes: "bg-slate-100 text-[#64748B]" } : statusConfig[status] ?? statusConfig.UPCOMING;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F172A] truncate">{title}</p>
          <p className="mt-0.5 text-sm text-[#64748B] truncate">{address}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusCfg.classes}`}>
          {statusCfg.label}
        </span>
      </div>

      {description && <p className="mt-3 text-sm text-[#64748B]">{description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
        <span>📅 {formatDate(startDate)} – {formatDate(endDate)}</span>
        <span className="font-semibold text-[#0369A1]">👥 {rsvpCount} registered donor{rsvpCount !== 1 ? "s" : ""}</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1 font-medium text-[#0F172A]">
          <span className="flex items-center gap-1.5">
            Target Goal
            {goalReached && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-[#16A34A]">
                ✓ Goal Met!
              </span>
            )}
          </span>
          <span className={goalReached ? "font-bold text-[#16A34A]" : ""}>
            {collected} / {maxCapacity} units ({rawPct.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${progressColor}`}
          />
        </div>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
