export function findFirst<T>(array: Array<T>, visitor: (item: T)=>boolean) {
  for (let i = 0; i < array.length; i++) {
    if (visitor(array[i])) {
      return array[i]
    }
  }
}