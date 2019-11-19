export function unionSet<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  setB.forEach(i => setA.add(i));
  return setA;
}