import { BushListener } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BoosterMessageListener extends BushListener {
	public constructor() {
		super('boosterMessage', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']): Promise<unknown> {
		if (message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION' && message.guild.id === this.client.consts.mappings.guilds.bush) {
			return await message.react('<:nitroboost:785160348885975062>').catch(() => {
				void this.client.console.warn('BoosterMessage', `Failed to react to <<${message.id}>>.`);
			});
		}
	}
}
