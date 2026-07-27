"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent: "red" | "blue" | "teal";
  index?: number;
};

const accentMap = {
  red: {
    icon: "bg-red-50 text-[#B91C1C]",
    label: "text-[#B91C1C]",
    border: "border-red-100",
  },
  blue: {
    icon: "bg-[#E0F2FE] text-[#0369A1]",
    label: "text-[#0369A1]",
    border: "border-blue-100",
  },
  teal: {
    icon: "bg-teal-50 text-[#0D9488]",
    label: "text-[#0D9488]",
    border: "border-teal-100",
  },
};

export function StatCard({ label, value, icon, accent, index = 0 }: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`rounded-xl border bg-white p-6 shadow-sm ${colors.border}`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${colors.icon}`}>{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#0F172A]">{value}</p>
      <p className={`mt-1 text-sm font-medium ${colors.label}`}>{label}</p>
    </motion.div>
  );
}
