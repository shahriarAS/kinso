export const PAYMENT_METHODS = [
  "CASH",
  "BKASH", 
  "ROCKET",
  "NAGAD",
  "BANK",
  "CARD"
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Cash", value: "CASH" },
  { label: "bKash", value: "BKASH" },
  { label: "Rocket", value: "ROCKET" },
  { label: "Nagad", value: "NAGAD" },
  { label: "Bank Transfer", value: "BANK" },
  { label: "Card", value: "CARD" },
];

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  CASH: "mdi:cash",
  BKASH: "mdi:cellphone",
  ROCKET: "mdi:rocket",
  NAGAD: "mdi:wallet",
  BANK: "mdi:bank",
  CARD: "mdi:credit-card",
};
