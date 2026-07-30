export interface CartItem {
  price: number;
  quantity: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  vat: number;
  shipping: number;
  total: number;
}

export interface ComputeTotalOptions {
  promoCode?: string;
  vatRate?: number;
}

export const VAT_RATE = 0.2;

const PROMOS: Record<string, number> = { BIENVENUE10: 0.1 };

const TIER_THRESHOLD = 100;
const TIER_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5;

function assertItem(item: CartItem): void {
  if (
    !item ||
    typeof item.price !== 'number' ||
    typeof item.quantity !== 'number'
  ) {
    throw new Error('Article invalide');
  }
  if (item.price < 0) {
    throw new Error('Prix négatif interdit');
  }
  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    throw new Error('Quantité invalide');
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function subtotal(items: CartItem[]): number {
  if (!Array.isArray(items)) {
    throw new Error('items doit être un tableau');
  }
  return items.reduce((sum, item) => {
    assertItem(item);
    return sum + item.price * item.quantity;
  }, 0);
}

export function tierDiscount(sub: number): number {
  return sub > TIER_THRESHOLD ? sub * TIER_RATE : 0;
}

export function promoDiscount(sub: number, code?: string): number {
  if (!code) {
    return 0;
  }
  const rate = PROMOS[code];
  if (rate === undefined) {
    throw new Error('Code promo invalide');
  }
  return sub * rate;
}

export function shipping(sub: number): number {
  if (sub <= 0) {
    return 0;
  }
  return sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function computeTotal(
  items: CartItem[],
  { promoCode, vatRate = VAT_RATE }: ComputeTotalOptions = {},
): PriceBreakdown {
  const sub = subtotal(items);
  const discount = round2(tierDiscount(sub) + promoDiscount(sub, promoCode));
  const taxable = Math.max(0, sub - discount);
  const vat = round2(taxable * vatRate);
  const ship = shipping(sub);
  const total = Math.max(0, round2(taxable + vat + ship));

  return { subtotal: round2(sub), discount, vat, shipping: ship, total };
}
