export interface Country {
  code: string;
  name: string;
  phoneCode: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", phoneCode: "+1" },
  { code: "CA", name: "Canada", phoneCode: "+1" },
  { code: "GB", name: "United Kingdom", phoneCode: "+44" },
  { code: "AU", name: "Australia", phoneCode: "+61" },
  { code: "NZ", name: "New Zealand", phoneCode: "+64" },
  { code: "IN", name: "India", phoneCode: "+91" },
  { code: "SG", name: "Singapore", phoneCode: "+65" },
  { code: "MY", name: "Malaysia", phoneCode: "+60" },
  { code: "PH", name: "Philippines", phoneCode: "+63" },
  { code: "TH", name: "Thailand", phoneCode: "+66" },
  { code: "VN", name: "Vietnam", phoneCode: "+84" },
  { code: "ID", name: "Indonesia", phoneCode: "+62" },
  { code: "BD", name: "Bangladesh", phoneCode: "+880" },
  { code: "PK", name: "Pakistan", phoneCode: "+92" },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find((c) => c.name === name);
}

export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): { valid: boolean; error?: string } {
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Most countries have 10 digits after country code
  // Some like India have 10, US has 10, UK has 11, Australia has 9
  const phoneLengths: { [key: string]: number[] } = {
    US: [10],
    CA: [10],
    GB: [10, 11],
    AU: [9],
    NZ: [9],
    IN: [10],
    SG: [8],
    MY: [9, 10],
    PH: [10],
    TH: [9, 10],
    VN: [9, 10],
    ID: [10, 11],
    BD: [10],
    PK: [10],
  };

  const validLengths = phoneLengths[countryCode] || [10];

  if (!validLengths.includes(cleaned.length)) {
    return {
      valid: false,
      error: `Phone number should be ${validLengths.join(" or ")} digits for ${countryCode}`,
    };
  }

  return { valid: true };
}

export function validatePhoneNumberByCode(
  phoneNumber: string,
  phoneCode: string
): { valid: boolean; error?: string } {
  // Find the country code from phone code
  const country = COUNTRIES.find((c) => c.phoneCode === phoneCode);
  if (!country) {
    return { valid: false, error: "Invalid country code" };
  }
  return validatePhoneNumber(phoneNumber, country.code);
}
