import { BotCommand, BotInhibitor, InhibitorReason, InhibitorType, type SlashMessage } from '#lib';
import type { Message } from 'discord.js';

export default class CannotSendInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.CannotSend, {
			reason: InhibitorReason.CannotSend,
			type: InhibitorType.Post,
			priority: 1000
		});
	}

	public exec(message: Message | SlashMessage, command: BotCommand): boolean {
		// let it error if it is the owner
		if (this.client.isOwner(message.author)) return false;
		if (!message.inGuild() || !message.channel) return false;
		if (command.skipSendCheck) return false;

		if (!message.guild.members.me) throw new Error(`Client member not cached in ${message.guild.name} (${message.guild.id})`);

		// doesn't apply to slash commands
		if (message.util?.isSlash !== true) return false;

		const sendPerm = message.channel.isThread() ? 'SendMessages' : 'SendMessagesInThreads';

		const perms = message.channel.permissionsFor(message.guild.members.me);

		if (perms == null) {
			// todo: remove once forum channels are fixed
			if (message.channel.isThread() && message.channel.parent == null) {
				return false;
			} else {
				return true;
			}
		}

		return !perms.has(sendPerm);
	}
}
