
// just for code simplify
export function defaultValue<T>(value: T, defaultValue: T) {
  if (value === undefined) {
    return defaultValue
  }
  return value;
}
