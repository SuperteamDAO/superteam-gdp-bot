import 'dotenv/config';
import client from './client';
import logger from './utils/logger';
import gdpDiscordQueue from "./queue";
import { Job, DoneCallback } from 'bull';
import { setGdp, getGdp } from './helpers';

// set gdp on discord channel
gdpDiscordQueue.process(async (job: Job, done: DoneCallback) => {
  // job.data contains the custom data passed when the job was created
  // job.id contains id of this job.

  // login
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    logger.error('No token found');
    done(new Error('No token found'));
  }

  try {
    await client.login(token);
    // report progress on redis
    job.progress(15);
    const gdp = await getGdp();
    job.progress(50);
    const jobResult = await setGdp(gdp, client);
    job.progress(100);
    // call done when finished
    done(null, { ...jobResult, status: 'Setting up GDP Succeeded' });
  } catch (e) {
    // give an error if error
    done(e);
  }

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error');
});

// schedule process to execute processGdp 
// at every 1 Hour (10 mins * 2 times is discord rate limit)
gdpDiscordQueue.add(null, { repeat: { cron: '*/10 * * * *' } });