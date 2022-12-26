import { default as Redis } from "ioredis";
import Env from "../configs/index.js";

// PART Redis configuration
//

const RedisObj = new Redis.default(Env.redis);
export type KVPair = Record<string, string>;
const getKey = (obj: KVPair) => Object.keys(obj)[0];

class RedisCache {
  redis: Redis.default;
  constructor() {
    this.redis = RedisObj;
  }
  /**
   * Saves a `{key: value}` pair to
   * the Redis cahce. This will return
   * a promise.
   */
  async SaveKeyValue(data: KVPair) {
    let key = getKey(data);
  }
  /**
   * Retrieves the value of `key` from
   * the cache.
   */
  async GetKeyValue(key: string) {}
  /**
   * Removes the `{key: value}` pair
   * of the given `key` from the cache.
   */
  DeleteKeyValue(key: string) {
    let output;
    this.redis.del(key, (_, result) => {
      output = result ? true : false;
    });
    return output;
  }
  ClearKeys(keys: string[]) {
    let output;
    this.redis.del(keys, (_, result) => {
      output = result ? true : false;
    });
    return output;
  }
}

export const redisCache = new RedisCache();

const s = redisCache.SaveKeyValue({ foo: "bar" });
