import { add } from './math';

const invalidValues: unknown[] = ['2', null, undefined, NaN, {}, true];

describe('add — combinaisons valides', () => {
  test.each([
    [2, 3, 5],
    [-2, -3, -5],
    [0, 0, 0],
    [-5, 5, 0],
    [1000000, 1, 1000001],
  ])('add(%p, %p) = %p', (x, y, expected) => {
    // Arrange dans les paramètres
    // Act
    const r = add(x, y);
    // Assert
    expect(r).toBe(expected);
  });

  test("l'addition de décimaux n'est pas arrondie", () => {
    // Arrange
    const x = 0.1;
    const y = 0.2;
    // Act
    const r = add(x, y);
    // Assert
    expect(r).toBeCloseTo(0.3, 10);
    expect(r).not.toBe(0.3);
  });
});

describe('add — entrées invalides', () => {
  test.each(invalidValues)('rejette %p en premier argument', (value) => {
    // Act & Assert
    expect(() => add(value as number, 3)).toThrow(TypeError);
  });

  test.each(invalidValues)('rejette %p en second argument', (value) => {
    // Act & Assert
    expect(() => add(3, value as number)).toThrow(TypeError);
  });

  test("le message d'erreur est explicite", () => {
    // Act & Assert
    expect(() => add('2' as unknown as number, 3)).toThrow(
      'add attend deux nombres',
    );
  });
});
