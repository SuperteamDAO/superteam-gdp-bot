import 'dotenv/config';
import { request } from 'undici';
import cron from 'node-cron';
import client from './client';
import logger from './utils/logger';

const token = process.env.DISCORD_TOKEN;

if (!token) {
 logger.error('No token found');
}

client.on('ready', () => {
 logger.info(`Logged in as ${client?.user?.tag}!`);
});

const getGdp = async (): Promise<string> => {
 const {
  body,
 } = await request('https://opensheet.elk.sh/1I6EEV3RTTPTI5ugX3IWvkjx39pjSym9tk4DBeoXyGys/Bounties%20Paid');

 const superteam_earnings = await body.json();

 const earnings_arr = superteam_earnings
  .map((x: Record<string, string>) => x['Total Earnings USD']
   ?.replace(',', ''))
  .filter((x: string) => !!x);

 const gdp = earnings_arr.reduce((acc: string, curr: string) => acc + Number(curr), 0);
 const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // minimumFractionDigits: 0,
  maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
 });

 return formatter.format(gdp);
};

const setGdp = async () => {
 const gdp = await getGdp();

 const superteam_guild_id = process.env.GUILD_ID as string;
 const guild = client.guilds.resolve(superteam_guild_id);

 if (!guild) {
  logger.error('No guild found');
  return;
 }

 //  guild.me?.setNickname(gdp);
 //  logger.info(`Done setting nickname to ${gdp}`);

 const channel = guild.channels.cache.find(chnl => chnl.name.includes('GDP:'));

 if (channel) {
  channel.setName(`GDP: ${gdp}`);
 } else {
  logger.info('Channel Doesn\'t exist');
 }
};

cron.schedule('*/30 * * * *', async () => {
 await client.login(token);
 await setGdp();
});
