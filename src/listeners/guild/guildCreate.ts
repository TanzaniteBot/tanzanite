import { BushClientEvents, BushListener, Guild } from '@lib';

export default class GuildCreateListener extends BushListener {
	public constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate', // when the bot joins a guild
			category: 'guild'
		});
	}

	public override async exec(...[guild]: BushClientEvents['guildCreate']) {
		void client.console.info(
			'guildCreate',
			`Joined <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`
		);
		const g = await Guild.findByPk(guild.id);
		if (!g) void Guild.create({ id: guild.id });
	}
}
