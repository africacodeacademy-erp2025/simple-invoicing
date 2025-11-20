export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: File | string | null;
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
}

export interface BankingInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  iban: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: string;
  isRecurring: boolean;
  recurringInterval: "weekly" | "monthly" | "quarterly" | "yearly";
  businessInfo: BusinessInfo;
  clientInfo: ClientInfo;
  bankingInfo: BankingInfo;
  lineItems: LineItem[];
  taxRate: number;
  discountRate: number;
  notes: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

import * as currencyCodes from "currency-codes";
import currencySymbolMap from "currency-symbol-map";

// Get all currencies from the package and sort them with popular ones first
const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "SEK",
  "NZD",
  "MXN",
  "SGD",
  "HKD",
  "NOK",
  "TRY",
  "RUB",
  "INR",
  "BRL",
  "ZAR",
  "KRW",
];

export const currencies = [
  // Popular currencies first
  ...POPULAR_CURRENCIES.map((code) => {
    const currency = currencyCodes.code(code);
    return currency
      ? {
          code: currency.code,
          name: currency.currency,
          symbol: currencySymbolMap(currency.code) || currency.code,
        }
      : null;
  }).filter(Boolean),

  // All other currencies
  ...currencyCodes
    .codes()
    .filter((code) => !POPULAR_CURRENCIES.includes(code))
    .map((code) => {
      const currency = currencyCodes.code(code);
      return currency
        ? {
            code: currency.code,
            name: currency.currency,
            symbol: currencySymbolMap(currency.code) || currency.code,
          }
        : null;
    })
    .filter(Boolean),
];
