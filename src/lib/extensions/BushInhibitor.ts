/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inhibitor } from 'discord-akairo';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushMessage } from './BushMessage';
import { BushSlashMessage } from './BushSlashMessage';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;

	public exec(message: BushMessage, command: BushCommand): any;
	public exec(message: BushMessage | BushSlashMessage, command: BushCommand): any {
		super.exec(message, command);
	}
}
