export function findFirst<T>(array: Array<T>, visitor: (item: T)=>boolean) {
  for (let i = 0; i < array.length; i++) {
    if (visitor(array[i])) {
      return array[i]
    }
  }
}

export function replaceFirst<T>(array: Array<T>, item: T, toReplace: T): boolean {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === item) {
      array[i] = toReplace;
      return true;
    }
  }
  return false;
}