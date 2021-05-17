import { User, Guild } from 'discord.js';
import { BotListener } from '../../lib/extensions/BotListener';
import { Ban } from '../../lib/models';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove'
		});
	}

	public async exec(guild: Guild, user: User): Promise<void> {
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
