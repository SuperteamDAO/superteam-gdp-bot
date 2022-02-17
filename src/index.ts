import 'dotenv/config';
import { request } from 'undici';
import { Client, Intents } from 'discord.js';
import logger from './utils/logger';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const token = process.env.DISCORD_TOKEN;

if (!token) {
 logger.error('No token found');
}

client.on('ready', () => {
 console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('interactionCreate', async interaction => {
 if (!interaction.isCommand()) return;

 if (interaction.commandName === 'ping') {
  await interaction.reply('Pong!');
 }
});

client.login(token);

const getGdp = async (): Promise<number> => {
 const {
  body,
 } = await request('https://opensheet.elk.sh/1I6EEV3RTTPTI5ugX3IWvkjx39pjSym9tk4DBeoXyGys/Bounties%20Paid');

 const superteam_earnings = await body.json();

 const earnings_arr = superteam_earnings
  .map((x: Record<string, string>) => x['Total Earnings USD']
   ?.replace(',', ''))
  .filter((x: string) => !!x);

 const gdp = earnings_arr.reduce((acc:string, curr:string) => acc + Number(curr), 0);

 return gdp;
};

(async () => {
 const gdp = await getGdp();
 logger.info(`GDP: ${gdp}`);
})();
