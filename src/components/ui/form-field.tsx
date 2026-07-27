type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({ label, hint, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#0F172A]">{label}</label>
      {hint && <p className="text-xs text-[#64748B]">{hint}</p>}
      {children}
      {error && <p className="text-xs text-[#B91C1C]">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20 transition-colors";

export const selectClass =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20 transition-colors";
