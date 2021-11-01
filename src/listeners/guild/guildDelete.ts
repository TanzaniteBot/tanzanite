import { BushListener, type BushClientEvents } from '#lib';

export default class GuildDeleteListener extends BushListener {
	public constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete', //when the bot leaves a guild
			category: 'guild'
		});
	}

	public override exec(...[guild]: BushClientEvents['guildDelete']): void {
		void client.console.info('guildDelete', `Left <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`);
	}
}
