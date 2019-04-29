
// just for code simplify
export function defaultValue<T>(value: T, defaultValue: T) {
  if (value === undefined) {
    return defaultValue
  }
  return value;
}

export function objKeyTo(obj: any): string[] {
  return Object.keys(obj).filter(k => typeof obj[k as any] === "number");
}