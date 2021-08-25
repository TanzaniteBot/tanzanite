import { BushListener } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class GuildDeleteListener extends BushListener {
	public constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete', //when the bot leaves a guild
			category: 'guild'
		});
	}

	public override exec(...[guild]: BushClientEvents['guildDelete']): void {
		void client.console.info('LeaveGuild', `Left <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`);
	}
}
