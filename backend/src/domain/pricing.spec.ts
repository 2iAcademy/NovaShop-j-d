import { CartItem, computeTotal, shipping, subtotal } from './pricing';

describe('subtotal', () => {
  test('panier vide => 0', () => {
    expect(subtotal([])).toBe(0);
  });

  test('somme prix x quantite', () => {
    expect(
      subtotal([
        { price: 10, quantity: 2 },
        { price: 5, quantity: 1 },
      ]),
    ).toBe(25);
  });

  test('quantite <= 0 => erreur', () => {
    expect(() => subtotal([{ price: 10, quantity: 0 }])).toThrow();
  });

  test('prix negatif => erreur', () => {
    expect(() => subtotal([{ price: -1, quantity: 1 }])).toThrow();
  });
});

describe('shipping (frais de port)', () => {
  test('offert au seuil de 50', () => {
    expect(shipping(50)).toBe(0);
  });

  test('5 en dessous de 50', () => {
    expect(shipping(49.99)).toBe(5);
  });

  test('panier vide => 0', () => {
    expect(shipping(0)).toBe(0);
  });
});

describe('computeTotal', () => {
  test('cas nominal : sub 20, TVA 4, port 5 => 29', () => {
    const r = computeTotal([{ price: 10, quantity: 2 }]);
    expect(r).toEqual({
      subtotal: 20,
      discount: 0,
      vat: 4,
      shipping: 5,
      total: 29,
    });
  });

  test('remise palier -5% au-dela de 100', () => {
    const r = computeTotal([{ price: 200, quantity: 1 }]);
    expect(r.discount).toBeCloseTo(10, 2);
    expect(r.shipping).toBe(0);
  });

  test('code promo valide', () => {
    const r = computeTotal([{ price: 100, quantity: 1 }], {
      promoCode: 'BIENVENUE10',
    });
    expect(r.discount).toBeCloseTo(10, 2);
  });

  test('code promo invalide => erreur', () => {
    const items: CartItem[] = [{ price: 10, quantity: 1 }];
    expect(() => computeTotal(items, { promoCode: 'XXX' })).toThrow();
  });
});
