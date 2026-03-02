export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceShort(price: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `ALT-${year}-${rand}`;
}

export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function daysFromNow(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function topProductsFromItems(
  items: { product_name: string; quantity: number }[],
  limit = 5
): { product_name: string; total_qty: number }[] {
  const map: Record<string, number> = {};
  for (const item of items) {
    map[item.product_name] = (map[item.product_name] || 0) + item.quantity;
  }
  return Object.entries(map)
    .map(([product_name, total_qty]) => ({ product_name, total_qty }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, limit);
}

export function groupByStatus(
  orders: { status: string }[]
): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const o of orders) {
    summary[o.status] = (summary[o.status] || 0) + 1;
  }
  return summary;
}

export function calcAvgCheck(revenue: number, paidCount: number): number {
  return paidCount > 0 ? Math.round(revenue / paidCount) : 0;
}
