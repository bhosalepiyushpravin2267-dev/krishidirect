import type { HomeDeliveryOrder } from "@/types/marketplace";

const STORAGE_KEY = "krishidirect-home-delivery-orders";

export function getHomeDeliveryOrders(): HomeDeliveryOrder[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as HomeDeliveryOrder[];
    } catch {
        return [];
    }
}

export function saveHomeDeliveryOrder(order: HomeDeliveryOrder): void {
    if (typeof window === "undefined") {
        return;
    }

    const orders = getHomeDeliveryOrders();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...orders]));
    window.dispatchEvent(new Event("krishidirect-delivery-updated"));
}

export function updateHomeDeliveryOrder(
    id: string,
    updates: Partial<HomeDeliveryOrder>
): void {
    if (typeof window === "undefined") {
        return;
    }

    const orders = getHomeDeliveryOrders().map((order) =>
        order.id === id ? { ...order, ...updates } : order
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("krishidirect-delivery-updated"));
}

export const DELIVERY_STATUS_LABEL: Record<
    HomeDeliveryOrder["status"],
    string
> = {
    placed: "Order Placed",
    packed: "Packed",
    "out-for-delivery": "Out for Delivery",
    delivered: "Delivered",
};
