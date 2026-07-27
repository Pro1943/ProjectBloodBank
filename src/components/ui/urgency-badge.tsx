type UrgencyBadgeProps = {
  urgency: "CRITICAL" | "URGENT" | "STANDARD";
};

const urgencyConfig = {
  CRITICAL: {
    wrapper: "bg-red-100 text-[#B91C1C] border border-red-200",
    dot: "bg-[#B91C1C] animate-pulse-dot",
    label: "Critical",
  },
  URGENT: {
    wrapper: "bg-[#FEF3C7] text-[#B45309] border border-amber-200",
    dot: "bg-[#D97706]",
    label: "Urgent",
  },
  STANDARD: {
    wrapper: "bg-[#E0F2FE] text-[#0369A1] border border-blue-200",
    dot: "bg-[#0369A1]",
    label: "Standard",
  },
};

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const config = urgencyConfig[urgency];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.wrapper}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
