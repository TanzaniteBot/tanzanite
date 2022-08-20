import { type BushCommand, type CommandMessage, type SlashMessage } from '#lib';
import { Inhibitor } from 'discord-akairo';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Message } from 'discord.js';

export abstract class BushInhibitor extends Inhibitor {
	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 *
	 * **Note:** `'all'` type inhibitors do not have {@link Message.util} defined.
	 *
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	public abstract override exec(message: CommandMessage, command: BushCommand): any;
	public abstract override exec(message: CommandMessage | SlashMessage, command: BushCommand): any;
}
