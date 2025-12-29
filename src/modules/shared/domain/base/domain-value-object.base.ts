/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
    this.validate(props);
  }

  protected validate(_props: T): void {}

  equals(vo?: ValueObject<T>): boolean {
    if (!vo) return false;
    if (vo.constructor !== this.constructor) return false;

    return ValueObject.shallowEqual(this.props, vo.props);
  }

  private static shallowEqual(
    a: Record<string, unknown>,
    b: Record<string, unknown>,
  ): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => Object.is(a[key], b[key]));
  }
}
