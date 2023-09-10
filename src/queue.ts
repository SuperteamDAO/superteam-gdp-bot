import Queue from 'bull';
import 'dotenv/config';

const gdpDiscordQueue = new Queue('gdp_discord', {
  redis: {
    port: 16796,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME
  },
});

export default gdpDiscordQueue;
