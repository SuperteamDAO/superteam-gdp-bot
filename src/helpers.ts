import { request } from 'undici';
import Big from 'big.js';
import logger from './utils/logger';
import { Client } from "discord.js";

export const setGdp = async (gdp: string, client: Client<boolean>) => {
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

  return {
    channel_name: channel?.name,
    gdp,
    guild_name: guild.name
  }
};

// get and process gdp data to json or someth
export const getGdp = async (): Promise<string> => {
  const {
    body,
  } = await request('https://opensheet.elk.sh/1I6EEV3RTTPTI5ugX3IWvkjx39pjSym9tk4DBeoXyGys/Bounties%20Paid');

  const superteam_earnings = await body.json();

  const earnings_arr = superteam_earnings
    .map((x: Record<string, string>) => x['Total Earnings USD']
      ?.replace(',', ''))
    .filter((x: string) => !!x)
    .map((x: string) => {
      try {
        if (x.includes('$')) {
          x = x.replace('$', '');
        }
        return Big(x);
      } catch (err) {
        logger.info(x);
        logger.error(err);
        return Big(0);
      }
    });

  const gdp = earnings_arr.reduce((acc: Big, curr: Big) => curr.add(acc), 0);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    // minimumFractionDigits: 0,
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  return formatter.format(gdp);
};
