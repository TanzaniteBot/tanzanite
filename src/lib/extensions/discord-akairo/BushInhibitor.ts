import { type BushClient, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { Inhibitor } from 'discord-akairo';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;
}

export interface BushInhibitor {
	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	exec(message: BushMessage, command: BushCommand): any;
	exec(message: BushMessage | BushSlashMessage, command: BushCommand): any;
}
