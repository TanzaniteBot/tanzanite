/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inhibitor } from 'discord-akairo';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushSlashMessage } from './BushSlashMessage';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;

	public exec(message: BushMessage, command: BushCommand): any;
	public exec(message: BushMessage | BushSlashMessage, command: BushCommand): any {
		return super.exec(message, command);
	}
}
