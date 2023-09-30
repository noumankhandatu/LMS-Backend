const Redis = require("redis");

const redisCli = () => {
  if (process.env.REDIS_URL) {
    console.log(process.env.REDIS_URL);
    return process.env.REDIS_URL;
  } else {
    console.log(process.env.REDIS, "conneciton failed of redis");
  }
};

const redisClient = new Redis(redisCli());
module.exports = { redisClient };
