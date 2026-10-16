export type ProfileRow = {
  id: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  gender?: string | null;
  phone?: string | null;
};

export const NOT_UPDATED = "Not updated";

export type PhoneParts = {
  country_code: string;
  phone_number: string;
};

export function splitPhone(full?: string | null): PhoneParts {
  if (!full) {
    return { country_code: "+1", phone_number: "" };
  }
  const normalized = full.replace(/\s/g, "");
  const match = normalized.match(/^(\+\d{1,3})(\d+)$/);
  if (match) {
    return { country_code: match[1], phone_number: match[2] };
  }
  return { country_code: "+1", phone_number: normalized.replace(/\D/g, "") };
}

function metadataString(
  user: { user_metadata?: Record<string, unknown> | null } | undefined,
  key: string,
): string {
  const value = user?.user_metadata?.[key];
  if (value == null || value === "") {
    return "";
  }
  return String(value);
}

/** Prefer separate `country_code` + `phone` in user_metadata; fall back to auth phone. */
export function resolvePhoneParts(
  user:
    | {
        phone?: string | null;
        user_metadata?: Record<string, unknown> | null;
      }
    | undefined,
): PhoneParts {
  const phone_number = metadataString(user, "phone");
  const country_code = metadataString(user, "country_code") || "+1";

  if (phone_number) {
    return { country_code, phone_number };
  }

  const full = user?.phone?.replace(/\s/g, "") ?? "";
  if (full) {
    return splitPhone(full);
  }

  return { country_code, phone_number: "" };
}

export function formatPhoneFull(parts: PhoneParts): string {
  if (!parts.phone_number) {
    return "";
  }
  return `${parts.country_code}${parts.phone_number}`;
}

export function formatPhoneDisplay(
  phone?: string | PhoneParts | null,
): string {
  if (phone == null) {
    return NOT_UPDATED;
  }
  if (typeof phone === "string") {
    return phone || NOT_UPDATED;
  }
  const formatted = formatPhoneFull(phone);
  return formatted || NOT_UPDATED;
}

export function parseDateOnly(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateOnlyIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToDisplay(iso?: string | null): string {
  if (!iso) {
    return "";
  }
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return iso;
  }
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

export function formatDobDisplay(dob?: string | null): string {
  if (!dob) {
    return NOT_UPDATED;
  }
  const formatted = isoToDisplay(dob);
  return formatted || NOT_UPDATED;
}

export function displayValue(value?: string | null): string {
  if (value == null || value === "") {
    return NOT_UPDATED;
  }
  return String(value);
}
