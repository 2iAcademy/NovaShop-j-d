import { CartItem, computeTotal } from './pricing';

export interface Cart {
  items: CartItem[];
  promoCode?: string;
}

export interface OrderPayload {
  items: CartItem[];
  total: number;
}

export interface Order extends OrderPayload {
  id: number;
}

export interface OrderRepository {
  save(payload: OrderPayload): Order;
}

export interface OrderNotifier {
  notifyOwner(order: Order): void;
}

export interface CreateOrderDependencies {
  repo: OrderRepository;
  notifier: OrderNotifier;
}

export function createOrder(
  cart: Cart,
  { repo, notifier }: CreateOrderDependencies,
): Order {
  const totals = computeTotal(cart.items, { promoCode: cart.promoCode });
  const order = repo.save({ items: cart.items, total: totals.total });
  notifier.notifyOwner(order);

  return order;
}
