import { type BushClient, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { Inhibitor } from 'discord-akairo';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;
}

export interface BushInhibitor {
	exec(message: BushMessage, command: BushCommand): any;
	exec(message: BushMessage | BushSlashMessage, command: BushCommand): any;
}
