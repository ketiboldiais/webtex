export class LRU<K, V> {
  capacity: number;
  cache: Map<K, V>;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  getItem(key: K) {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }
  putItem(key: K, val: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size === this.capacity) {
      this.cache.delete(this.oldestItem);
    }
    this.cache.set(key, val);
    return this;
  }
  get oldestItem() {
    return this.cache.keys().next().value;
  }
}
