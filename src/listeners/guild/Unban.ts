import { User } from 'discord.js';
import { BotGuild } from '../../lib/extensions/BotGuild';
import { BotListener } from '../../lib/extensions/BotListener';
import { Ban } from '../../lib/types/Models';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove'
		});
	}

	public async exec(guild: BotGuild, user: User): Promise<void> {
		const bans = await Ban.findAll({
			where: {
				user: user.id,
				guild: guild.id
			}
		});
		for (const dbBan of bans) {
			await dbBan.destroy();
		}
	}
}
