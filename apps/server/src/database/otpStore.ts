import Redis from "ioredis";
import { RedisConfig } from "src/configs";

// PART Redis configuration
//

const RedisObj = new Redis(RedisConfig);
export type KVPair = Record<string, string>;
const getKey = (obj: KVPair) => Object.keys(obj)[0];

class RedisCache {
  redis: Redis;
  constructor() {
    this.redis = RedisObj;
  }
  /**
   * Saves a `{key: value}` pair to
   * the Redis cahce. This will return
   * a promise.
   */
  SaveKeyValue(data: KVPair) {
    let key = getKey(data);
    let output;
    this.redis.set(key, data[key], (_, result) => {
      output = result === "OK";
    });
    return output;
  }
  /**
   * Retrieves the value of `key` from
   * the cache.
   */
  GetKeyValue(key: string) {
    let output;
    this.redis.get(key, (error, result) => {
      output = error ? null : result;
    });
    return output;
  }
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
