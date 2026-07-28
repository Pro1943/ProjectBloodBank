export function getEffectiveCampStatus(
  startDate: string | Date,
  endDate: string | Date,
  storedStatus: string,
  now: Date = new Date()
): { status: string; isPast: boolean } {
  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  const nowTime = now.getTime();

  if (endTime < nowTime) {
    return { status: "COMPLETED", isPast: true };
  }

  if (startTime <= nowTime) {
    return { status: "ACTIVE", isPast: false };
  }

  return { status: storedStatus, isPast: false };
}
