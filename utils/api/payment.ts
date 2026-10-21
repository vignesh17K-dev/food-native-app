import utils from "../utils";

export type CardProvider = "demo" | "razorpay";

export type SavedCard = {
  payment_method_id: string;
  provider: CardProvider;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  createdAt?: string;
};

export type CardBrand = "Visa" | "Mastercard" | "RuPay";

export type AddCardRequest = {
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
};

type ApiResponse<T> = {
  status: number;
  data: T;
  message: string;
};

const paymentCards = {
  get_all_cards: (): Promise<ApiResponse<SavedCard[]>> => {
    return utils.api_request({
      url: "api/payment/all_cards",
      method: "GET",
    });
  },

  add_card: (data: AddCardRequest): Promise<ApiResponse<SavedCard>> => {
    return utils.api_request({
      url: "api/payment/add_card",
      method: "POST",
      data,
    });
  },

  delete_card: (payment_method_id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return utils.api_request({
      url: `api/payment/delete_card/${payment_method_id}`,
      method: "DELETE",
    });
  },
};

export default paymentCards;

/** Format API month/year as MM/YY for card UI. */
export function formatExpiryMmYy(month: number, year: number): string {
  const mm = String(month).padStart(2, "0");
  const yy = String(year).slice(-2).padStart(2, "0");
  return `${mm}/${yy}`;
}

export function parseCardExpiry(expiry: string): {
  expiryMonth: number;
  expiryYear: number;
} | null {
  const digits = expiry.replace(/\D/g, "");
  if (digits.length !== 4) {
    return null;
  }

  const expiryMonth = Number(digits.slice(0, 2));
  const yy = Number(digits.slice(2, 4));
  const expiryYear = 2000 + yy;

  if (expiryMonth < 1 || expiryMonth > 12) {
    return null;
  }

  return { expiryMonth, expiryYear };
}

export function buildAddCardPayload(
  cardNumber: string,
  expiryDate: string,
  brand: CardBrand = "Visa",
  cardholderName = "",
): AddCardRequest | null {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13) {
    return null;
  }

  const expiry = parseCardExpiry(expiryDate);
  if (!expiry) {
    return null;
  }

  const trimmedName = cardholderName.trim();
  if (!trimmedName) {
    return null;
  }

  return {
    brand,
    last4: digits.slice(-4),
    expiryMonth: expiry.expiryMonth,
    expiryYear: expiry.expiryYear,
    cardholderName: trimmedName,
  };
}
