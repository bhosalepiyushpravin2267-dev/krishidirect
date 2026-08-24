import { orders } from "@/lib/db/mock-db";
import type { Order } from "@/types/backend";

export function getAllOrders(): Order[] {
  return orders;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function saveOrder(order: Order): Order {
  orders.push(order);
  return order;
}

export function updateOrder(
  id: string,
  updates: Partial<Order>
): Order | undefined {
  const index = orders.findIndex((order) => order.id === id);

  if (index === -1) {
    return undefined;
  }

  orders[index] = {
    ...orders[index],
    ...updates,
  };

  return orders[index];
}
