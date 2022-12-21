import * as redis from "redis";

const redisClient = redis.createClient();
redisClient.on("error", (error) =>
  console.error(`Redis client error: ${error}`)
);
export { redisClient };
