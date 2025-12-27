/**
 * Prettify utility type
 * Flattens nested type intersections for cleaner type hints
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
