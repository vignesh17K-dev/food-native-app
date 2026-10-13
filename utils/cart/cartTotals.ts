export type CartLineForTotal = {
  price?: number;
  quantity?: number;
};

export function calculateLineTotal(item: CartLineForTotal): number {
  return (item.price ?? 0) * (item.quantity ?? 1);
}

export function calculateCartSubtotal(items: CartLineForTotal[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}
