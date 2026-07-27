"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  fulfilled: number;
  needed: number;
};

export function ProgressBar({ fulfilled, needed }: ProgressBarProps) {
  const pct = needed > 0 ? Math.min((fulfilled / needed) * 100, 100) : 0;
  const isFull = pct >= 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <span>{fulfilled} of {needed} units</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${isFull ? "bg-[#0D9488]" : "bg-[#0369A1]"}`}
        />
      </div>
    </div>
  );
}
