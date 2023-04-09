export class LRU<K,V> {
  capacity: number;
  cache: Map<K, V>;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  hasKey(key: K) {
    return this.cache.has(key);
  }
  get(key: K) {
    const item = this.cache.get(key);
    if (item !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }
  put(key: K, val: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size === this.capacity) {
      this.cache.delete(this.oldestItem);
    }
    this.cache.set(key, val);
  }
  get oldestItem() {
    return this.cache.keys().next().value;
  }
}

export const cacheLRU = <v,>(cap = 50) => new LRU<string,v>(cap);
