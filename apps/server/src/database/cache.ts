import { default as Redis } from "ioredis";
import Env from "../configs/index.js";
import { logit } from "src/middleware/logger.js";

const RedisDB = new Redis.default(Env.redis);

export type obj = Record<string, string>;

class RedisCache {
  redis: Redis.Redis;
  constructor() {
    this.redis = RedisDB;
  }
  async delete(key: string) {
    try {
      await this.redis.del(key);
    } catch (error) {
      return null;
    }
  }
  async getValue(key: string) {
    try {
      let result = await this.redis.get(key);
      return result;
    } catch (error) {
      return false;
    }
  }
  async saveTemp(key: string, val: string) {
    try {
      await this.redis
        .multi()
        .set(key, val)
        .expire(key, Env.cacheExpiration)
        .exec();
      await logit(`{${key}: ${val}} in Redis for ${Env.cacheExpiration}s.`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const cache = new RedisCache();
