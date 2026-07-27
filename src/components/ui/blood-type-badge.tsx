const bloodTypeColors: Record<string, string> = {
  O_NEG: "bg-red-100 text-[#B91C1C] border-red-200",
  O_POS: "bg-red-50 text-[#B91C1C] border-red-100",
  A_NEG: "bg-blue-100 text-[#0369A1] border-blue-200",
  A_POS: "bg-blue-50 text-[#0369A1] border-blue-100",
  B_NEG: "bg-teal-100 text-[#0D9488] border-teal-200",
  B_POS: "bg-teal-50 text-[#0D9488] border-teal-100",
  AB_NEG: "bg-amber-100 text-[#B45309] border-amber-200",
  AB_POS: "bg-amber-50 text-[#D97706] border-amber-100",
};

const bloodTypeLabels: Record<string, string> = {
  O_NEG: "O−",
  O_POS: "O+",
  A_NEG: "A−",
  A_POS: "A+",
  B_NEG: "B−",
  B_POS: "B+",
  AB_NEG: "AB−",
  AB_POS: "AB+",
};

type BloodTypeBadgeProps = {
  bloodType: string;
  size?: "sm" | "md" | "lg";
};

export function BloodTypeBadge({ bloodType, size = "md" }: BloodTypeBadgeProps) {
  const colors = bloodTypeColors[bloodType] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const label = bloodTypeLabels[bloodType] ?? bloodType;
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-bold ${colors} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
}
