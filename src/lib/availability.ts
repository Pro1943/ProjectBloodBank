export const DONATION_COOLDOWN_DAYS = 56;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

type DonorAvailabilityInput = {
  lastDonationDate: Date | string | null;
  isAvailabilityOptedIn?: boolean | null;
};

export function getDaysSinceDonation(lastDonationDate: Date | string | null, now = new Date()): number | null {
  if (!lastDonationDate) return null;
  return Math.floor((now.getTime() - new Date(lastDonationDate).getTime()) / MS_PER_DAY);
}

export function isBaseDonationEligible(lastDonationDate: Date | string | null, now = new Date()): boolean {
  const daysSinceDonation = getDaysSinceDonation(lastDonationDate, now);
  return daysSinceDonation === null || daysSinceDonation > DONATION_COOLDOWN_DAYS;
}

export function getDonorAvailability(donor: DonorAvailabilityInput, now = new Date()) {
  const daysSinceDonation = getDaysSinceDonation(donor.lastDonationDate, now);
  const isBaseEligible = daysSinceDonation === null || daysSinceDonation > DONATION_COOLDOWN_DAYS;
  const isAvailabilityOptedIn = donor.isAvailabilityOptedIn ?? true;

  return {
    daysSinceDonation,
    isBaseEligible,
    isAvailabilityOptedIn,
    isAvailable: isBaseEligible && isAvailabilityOptedIn,
  };
}
