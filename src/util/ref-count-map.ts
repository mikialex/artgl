export class RefCountMap<T>{
  map: Map<T, number> = new Map();

  add(item: T) {
    let old = this.map.get(item)
    if (old !== undefined) {
      this.map.set(item, old++);
    } else {
      this.map.set(item, 1);
    }
  }

  delete(item: T) {
    let old = this.map.get(item)
    if (old !== undefined) {
      if (old === 1) {
        this.map.delete(item);
      } else {
        this.map.set(item, old--);
      }
    }
  }

  forEach(visitor: (item: T) => any) {
    this.map.forEach((_value, key) => {
      visitor(key);
    })
  }

}