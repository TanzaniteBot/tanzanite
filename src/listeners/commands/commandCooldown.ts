import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';
import { MessageFlags } from 'discord.js';

export default class CommandCooldownListener extends BotListener {
	public constructor() {
		super('commandCooldown', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.Cooldown
		});
	}

	public async exec(...[message, command, remaining]: BotCommandHandlerEvents[CommandHandlerEvent.Cooldown]) {
		void this.client.console.info(
			'commandCooldown',
			`<<${message.author.tag}>> tried to run <<${
				command ?? message.util!.parsed?.command
			}>> but it is on cooldown for <<${Math.round(remaining / 1000)}>> seconds.`
		);
		message.util.isSlashMessage(message)
			? await message.util?.reply({
					content: `⏳ This command is on cooldown for ${Math.round(remaining / 1000)} seconds.`,
					flags: MessageFlags.Ephemeral
				})
			: await message.react('⏳').catch(() => null);
	}
}
