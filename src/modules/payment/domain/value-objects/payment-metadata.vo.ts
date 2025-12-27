/* eslint-disable @typescript-eslint/no-unused-vars */
import { ValueObject } from '@/modules/shared/domain/base/domain-value-object.base';

export class PaymentMetadata extends ValueObject<Record<string, unknown>> {
  protected validate(_props: Record<string, unknown>): void {
    // No validation needed - flexible metadata
  }

  public static create(data: Record<string, unknown>): PaymentMetadata {
    return new PaymentMetadata(data);
  }
}
