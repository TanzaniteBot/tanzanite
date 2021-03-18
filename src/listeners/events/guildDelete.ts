import { Guild } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';
import * as botoptions from '../../config/botoptions';
import log from '../../constants/log';

export default class guildDeleteListener extends BushListener {
	public constructor() {
		super('guildDeleteListener', {
			emitter: 'client',
			event: 'guildDelete', //when the bot joins a guild
			category: 'client'
		});
	}

	public exec(guild: Guild): void {
		if (botoptions.info) {
			log.info('GuildLeave', `Left <<${guild.name}>> with <<${guild.memberCount}>> members.`);
		}
	}
}
