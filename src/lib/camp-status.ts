export function getEffectiveCampStatus(
  startDate: string | Date,
  endDate: string | Date,
  storedStatus: string,
  now: Date = new Date()
): { status: string; isPast: boolean } {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < now) {
    return { status: "COMPLETED", isPast: true };
  }

  if (start <= now) {
    return { status: "ACTIVE", isPast: false };
  }

  return { status: storedStatus, isPast: false };
}
