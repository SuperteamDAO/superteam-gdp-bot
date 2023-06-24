import 'dotenv/config';
import { request } from 'undici';
import cron from 'node-cron';
import client from './client';
import logger from './utils/logger';

const getGdp = async (): Promise<string> => {
 const {
  body,
 } = await request('https://socftnkojidkvtmjmyha.supabase.co/storage/v1/object/public/earnings/projects.json');
 if (!body) {
  logger.error('Error fetching data');
 }

 const superteam_projects = await body.json();

 const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
 });

 return formatter.format(Math.round(
  superteam_projects.reduce(
   (sum: number, project: any) => sum + (project.fields['Total Earnings USD'] || 0),
   0,
  ),
 ));
};

const setGdp = async () => {
 const gdp = await getGdp();

 const superteam_guild_id = process.env.GUILD_ID as string;
 const guild = await client.guilds.cache.get(superteam_guild_id);

 if (!guild) {
  logger.error('No guild found');
  return;
 }

 logger.info(gdp);

 //  guild.me?.setNickname(gdp);
 //  logger.info(`Done setting nickname to ${gdp}`);

 const channel = guild.channels.cache.find(chnl => chnl.name.includes('GDP:'));

 if (channel) {
  channel.setName(`📈 | GDP: ${gdp}`);
  logger.info(`📈 | GDP: ${gdp}`);
  logger.info('Updated channel name');
 } else {
  logger.info('Channel Doesn\'t exist');
 }
};

cron.schedule('*/30 * * * *', async () => {
 const token = process.env.DISCORD_TOKEN;

 if (!token) {
  logger.error('No token found');
  return;
 }

 await client.login(token);

 client.on('ready', async () => {
  logger.info(`Logged in as ${client?.user?.tag}!`);
  try {
   await setGdp();
  } catch (error) {
   logger.error(error);
  }
 });
});
