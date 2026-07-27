const COMPATIBILITY_MAP: Record<string, string[]> = {
  A_POS: ["A_POS", "A_NEG", "O_POS", "O_NEG"],
  A_NEG: ["A_NEG", "O_NEG"],
  B_POS: ["B_POS", "B_NEG", "O_POS", "O_NEG"],
  B_NEG: ["B_NEG", "O_NEG"],
  AB_POS: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"],
  AB_NEG: ["A_NEG", "B_NEG", "AB_NEG", "O_NEG"],
  O_POS: ["O_POS", "O_NEG"],
  O_NEG: ["O_NEG"],
};

export function getCompatibleDonorTypes(recipientBloodType: string): string[] {
  return COMPATIBILITY_MAP[recipientBloodType] || [];
}

export function checkBloodCompatibility(donorBloodType: string, recipientBloodType: string): boolean {
  const compatibleTypes = COMPATIBILITY_MAP[recipientBloodType];
  if (!compatibleTypes) {
    return false;
  }
  return compatibleTypes.includes(donorBloodType);
}
