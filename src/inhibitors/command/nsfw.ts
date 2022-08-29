import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';
import { type TextChannel } from 'discord.js';

export default class NsfwInhibitor extends BotInhibitor {
	public constructor() {
		super('nsfw', {
			reason: 'notNsfw',
			type: 'post',
			priority: 25
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.onlyNsfw && !(message.channel as TextChannel).nsfw) {
			void this.client.console.verbose(
				'notNsfw',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
			);
			return true;
		}
		return false;
	}
}
