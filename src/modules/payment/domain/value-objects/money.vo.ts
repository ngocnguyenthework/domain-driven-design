import { ValueObject } from '@/modules/shared/domain/base/domain-value-object.base';

export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(props: { amount: number; currency: string }) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  // ISO 4217 currency codes validation
  private static readonly VALID_CURRENCIES = new Set([
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'AUD',
    'CAD',
    'CHF',
    'CNY',
    'INR',
  ]);

  protected validate(props: { amount: number; currency: string }): void {
    if (props.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!Money.VALID_CURRENCIES.has(props.currency)) {
      throw new Error(`Invalid currency code: ${props.currency}`);
    }
  }

  public static create(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }
}
