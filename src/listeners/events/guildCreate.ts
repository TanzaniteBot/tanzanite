import { Guild } from 'discord.js';
import { BotListener } from '../../lib/extensions/BotListener';
import * as botoptions from '../../config/botoptions';
import log from '../../constants/log';

export default class guildCreateListener extends BotListener {
	public constructor() {
		super('guildCreateListener', {
			emitter: 'client',
			event: 'guildCreate', //when the bot joins a guild
			category: 'client'
		});
	}

	public exec(guild: Guild): void {
		if (botoptions.info) {
			log.info('JoinGuild', `Joined <<${guild.name}>> with <<${guild.memberCount}>> members.`);
		}
	}
}
