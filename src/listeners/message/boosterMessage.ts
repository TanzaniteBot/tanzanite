import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events, MessageType } from 'discord.js';

export default class BoosterMessageListener extends BotListener {
	public constructor() {
		super('boosterMessage', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]) {
		if (!message.guild || !(await message.guild?.hasFeature('boosterMessageReact'))) return;
		if (
			[MessageType.GuildBoost, MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3].includes(
				message.type
			)
		) {
			return await message.react('<:nitroboost:785160348885975062>').catch(() => {
				void this.client.console.warn('boosterMessage', `Failed to react to <<${message.id}>>.`);
			});
		}
	}
}
