import { BushListener, Guild } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class GuildCreateListener extends BushListener {
	public constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate', // when the bot joins a guild
			category: 'guild'
		});
	}

	public override async exec(...[guild]: BushClientEvents['guildCreate']): Promise<void> {
		void client.console.info('JoinGuild', `Joined <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`);
		const g = await Guild.findByPk(guild.id);
		if (!g) void Guild.create({ id: guild.id });
	}
}
