import { Guild } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';
import * as botoptions from '../../config/botoptions';
import log from '../../lib/utils/log';

export default class guildCreateListener extends BushListener {
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
