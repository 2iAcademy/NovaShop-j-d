import { CartItem, computeTotal } from './pricing';

describe('TVA', () => {
  test('la TVA vaut 20 % du montant taxable', () => {
    // Arrange
    const items: CartItem[] = [{ price: 100, quantity: 1 }];
    // Act
    const r = computeTotal(items);
    // Assert
    expect(r.vat).toBe(20);
  });

  test('la TVA porte sur le montant remisé, pas sur le sous-total brut', () => {
    // Arrange
    const items: CartItem[] = [{ price: 200, quantity: 1 }];
    // Act
    const r = computeTotal(items);
    // Assert
    expect(r.discount).toBe(10);
    expect(r.vat).toBe(38);
  });
});

describe('remises', () => {
  test('le code promo BIENVENUE10 applique une remise de 10 %', () => {
    // Arrange
    const items: CartItem[] = [{ price: 40, quantity: 2 }];
    // Act
    const r = computeTotal(items, { promoCode: 'BIENVENUE10' });
    // Assert
    expect(r.discount).toBe(8);
  });

  test('le code promo se cumule avec la remise palier', () => {
    // Arrange
    const items: CartItem[] = [{ price: 200, quantity: 1 }];
    // Act
    const r = computeTotal(items, { promoCode: 'BIENVENUE10' });
    // Assert
    expect(r.discount).toBe(30);
    expect(r.total).toBe(204);
  });

  test("la remise palier ne s'applique pas à 100 € pile", () => {
    // Arrange
    const items: CartItem[] = [{ price: 100, quantity: 1 }];
    // Act
    const r = computeTotal(items);
    // Assert
    expect(r.discount).toBe(0);
  });
});

describe('frais de port', () => {
  test('le port est offert à partir de 50 € exactement', () => {
    // Arrange
    const items: CartItem[] = [{ price: 50, quantity: 1 }];
    // Act
    const r = computeTotal(items);
    // Assert
    expect(r.shipping).toBe(0);
  });

  test('le port coûte 5 € juste en dessous de 50 €', () => {
    // Arrange
    const items: CartItem[] = [{ price: 49.99, quantity: 1 }];
    // Act
    const r = computeTotal(items);
    // Assert
    expect(r.shipping).toBe(5);
  });

  test('le port reste offert quand la remise fait passer le taxable sous 50 €', () => {
    // Arrange
    const items: CartItem[] = [{ price: 55, quantity: 1 }];
    // Act
    const r = computeTotal(items, { promoCode: 'BIENVENUE10' });
    // Assert
    expect(r.shipping).toBe(0);
  });
});

describe('panier vide et garde-fous', () => {
  test('un panier vide donne un total de 0', () => {
    // Arrange
    const items: CartItem[] = [];
    // Act
    const r = computeTotal(items);
    // Assert
    expect(r).toEqual({
      subtotal: 0,
      discount: 0,
      vat: 0,
      shipping: 0,
      total: 0,
    });
  });

  test('le total ne descend jamais en dessous de 0', () => {
    // Arrange
    // Les remises plafonnent à 15 % (palier 5 % + promo 10 %) et ne peuvent donc
    // jamais dépasser le sous-total : un taux de TVA négatif est la seule entrée
    // publique qui rende le garde-fou Math.max(0, ...) atteignable.
    const items: CartItem[] = [{ price: 100, quantity: 1 }];
    // Act
    const r = computeTotal(items, { vatRate: -5 });
    // Assert
    expect(r.total).toBe(0);
  });
});

describe('validation des articles', () => {
  test('une quantité négative est refusée', () => {
    // Arrange
    const items: CartItem[] = [{ price: 10, quantity: -1 }];
    // Act & Assert
    expect(() => computeTotal(items)).toThrow('Quantité invalide');
  });

  test('une quantité décimale est refusée', () => {
    // Arrange
    const items: CartItem[] = [{ price: 10, quantity: 1.5 }];
    // Act & Assert
    expect(() => computeTotal(items)).toThrow('Quantité invalide');
  });

  test("un article dont le prix n'est pas un nombre est refusé", () => {
    // Arrange
    const items = [{ price: '10', quantity: 1 }] as unknown as CartItem[];
    // Act & Assert
    expect(() => computeTotal(items)).toThrow('Article invalide');
  });

  test('un article null est refusé', () => {
    // Arrange
    const items = [null] as unknown as CartItem[];
    // Act & Assert
    expect(() => computeTotal(items)).toThrow('Article invalide');
  });

  test("un panier qui n'est pas un tableau est refusé", () => {
    // Arrange
    const items = 'pas-un-panier' as unknown as CartItem[];
    // Act & Assert
    expect(() => computeTotal(items)).toThrow('items doit être un tableau');
  });
});
