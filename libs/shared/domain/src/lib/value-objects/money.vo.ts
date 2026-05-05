import Decimal from 'decimal.js';

export class Money {
  private readonly value: Decimal;

  constructor(value: number | string | Decimal) {
    this.value = new Decimal(value);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.value.plus(other.value));
  }

  subtract(other: Money): Money {
    return new Money(this.value.minus(other.value));
  }

  multiply(factor: number | Decimal): Money {
    return new Money(this.value.times(factor));
  }

  divide(divisor: number | Decimal): Money {
    return new Money(this.value.dividedBy(divisor));
  }

  toNumber(): number {
    return this.value.toNumber();
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  isNegative(): boolean {
    return this.value.isNegative();
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  greaterThan(other: Money): boolean {
    return this.value.greaterThan(other.value);
  }

  lessThan(other: Money): boolean {
    return this.value.lessThan(other.value);
  }
}
