import { Message } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';

export default class BoosterMessageListener extends BotListener {
	public constructor() {
		super('BoosterMessageListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}
	public exec(message: Message): Promise<void> {
		if (
			message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION' &&
			message.guild.id === '516977525906341928' &&
			message.channel.id === '784479510056665138'
		) {
			try {
				message.react('<:nitroboost:785160348885975062>').catch(() => {
					`[BoosterMessage] Failed to react to ${message.id}`;
				});
			} catch {
				return;
			}
		}
	}
}
