function assertNumber(value: unknown): void {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeError('add attend deux nombres');
  }
}

export function add(x: number, y: number): number {
  assertNumber(x);
  assertNumber(y);

  return x + y;
}
