/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inhibitor } from 'discord-akairo';
import { BushClient, BushCommand, BushMessage, BushSlashMessage } from '..';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;

	public exec(message: BushMessage, command: BushCommand): any;
	public exec(message: BushMessage | BushSlashMessage, command: BushCommand): any {
		super.exec(message, command);
	}
}
