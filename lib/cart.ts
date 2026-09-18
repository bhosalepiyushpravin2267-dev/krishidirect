import type { CartItem } from "@/types/marketplace";

export function mergeCartItem(
    cart: CartItem[],
    incoming: CartItem
): CartItem[] {
    const existing = cart.find((item) => item.id === incoming.id);

    if (!existing) {
        return [...cart, incoming];
    }

    return cart.map((item) =>
        item.id === incoming.id
            ? {
                  ...item,
                  quantityKg: Number(
                      (item.quantityKg + incoming.quantityKg).toFixed(2)
                  ),
                  pricePerKg: incoming.pricePerKg,
              }
            : item
    );
}

export function cartSubtotal(cart: CartItem[]): number {
    return cart.reduce(
        (sum, item) => sum + item.quantityKg * item.pricePerKg,
        0
    );
}

export const EXPRESS_DELIVERY_FEE = 49;
export const STANDARD_DELIVERY_FEE = 0;
