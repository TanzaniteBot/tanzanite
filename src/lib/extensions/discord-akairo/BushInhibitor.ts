import { type BushClient, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';
import { Inhibitor } from 'discord-akairo';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;
}

export interface BushInhibitor {
	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 *
	 * **Note:** `all` type inhibitors do not have `message.util` defined.
	 *
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	exec(message: CommandMessage, command: BushCommand): any;
	exec(message: CommandMessage | SlashMessage, command: BushCommand): any;
}
