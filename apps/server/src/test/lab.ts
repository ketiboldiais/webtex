export type KVPair = Record<string, string>;

const getKey = (obj: KVPair) => Object.keys(obj)[0];

class Cache {
  cache: any[];
  constructor() {
    this.cache = [];
  }
  save(data: KVPair) {
    let key = getKey(data);
    this.cache.push([key, data[key]]);
  }
}

const cache = new Cache();
const x = { john: "12358" };
cache.save(x);
console.log(cache.cache);
