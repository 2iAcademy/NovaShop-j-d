import {
  Cart,
  createOrder,
  Order,
  OrderNotifier,
  OrderPayload,
  OrderRepository,
} from './orderService';

function createDoubles() {
  // STUB : fournit un état (la commande persistée, avec son id)
  const save = jest.fn((payload: OrderPayload): Order => ({
    id: 1,
    ...payload,
  }));
  // MOCK : on vérifiera son comportement (appelé, une seule fois, avec quoi)
  const notifyOwner = jest.fn();

  const repo: OrderRepository = { save };
  const notifier: OrderNotifier = { notifyOwner };

  return { save, notifyOwner, repo, notifier };
}

describe('createOrder', () => {
  test('calcule, sauvegarde et notifie une fois', () => {
    // Arrange
    const { save, notifyOwner, repo, notifier } = createDoubles();
    const cart: Cart = { items: [{ price: 100, quantity: 1 }] };
    // Act
    const order = createOrder(cart, { repo, notifier });
    // Assert
    expect(order.total).toBeGreaterThan(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(notifyOwner).toHaveBeenCalledTimes(1);
  });

  test('sauvegarde le panier et le total calculé par pricing', () => {
    // Arrange
    const { save, repo, notifier } = createDoubles();
    const cart: Cart = { items: [{ price: 100, quantity: 1 }] };
    // Act
    createOrder(cart, { repo, notifier });
    // Assert
    // 100 + 20 % de TVA, port offert au-delà de 50 €
    expect(save).toHaveBeenCalledWith({ items: cart.items, total: 120 });
  });

  test('notifie avec la commande persistée, pas avec le brouillon', () => {
    // Arrange
    const { notifyOwner, repo, notifier } = createDoubles();
    const cart: Cart = { items: [{ price: 100, quantity: 1 }] };
    // Act
    const order = createOrder(cart, { repo, notifier });
    // Assert
    expect(notifyOwner).toHaveBeenCalledWith(order);
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
    );
  });

  test('retourne exactement la commande renvoyée par le repo', () => {
    // Arrange
    const persisted: Order = {
      id: 42,
      items: [{ price: 10, quantity: 1 }],
      total: 17,
    };
    const repo: OrderRepository = { save: jest.fn(() => persisted) };
    const notifier: OrderNotifier = { notifyOwner: jest.fn() };
    const cart: Cart = { items: [{ price: 10, quantity: 1 }] };
    // Act
    const order = createOrder(cart, { repo, notifier });
    // Assert
    expect(order).toBe(persisted);
  });

  test('transmet le code promo au calcul du total', () => {
    // Arrange
    const { save, repo, notifier } = createDoubles();
    const cart: Cart = {
      items: [{ price: 200, quantity: 1 }],
      promoCode: 'BIENVENUE10',
    };
    // Act
    createOrder(cart, { repo, notifier });
    // Assert
    // sans promo le total serait 228 ; avec la remise cumulée il tombe à 204
    expect(save).toHaveBeenCalledWith({ items: cart.items, total: 204 });
  });

  test('ne notifie pas quand la sauvegarde échoue', () => {
    // Arrange
    const { notifyOwner, notifier } = createDoubles();
    const repo: OrderRepository = {
      save: jest.fn(() => {
        throw new Error('base indisponible');
      }),
    };
    const cart: Cart = { items: [{ price: 100, quantity: 1 }] };
    // Act & Assert
    expect(() => createOrder(cart, { repo, notifier })).toThrow(
      'base indisponible',
    );
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  test('ne sauvegarde rien quand le panier est invalide', () => {
    // Arrange
    const { save, notifyOwner, repo, notifier } = createDoubles();
    const cart: Cart = { items: [{ price: 10, quantity: 0 }] };
    // Act & Assert
    expect(() => createOrder(cart, { repo, notifier })).toThrow(
      'Quantité invalide',
    );
    expect(save).not.toHaveBeenCalled();
    expect(notifyOwner).not.toHaveBeenCalled();
  });
});
