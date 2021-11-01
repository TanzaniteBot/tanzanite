import { type BushClient, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { Inhibitor } from 'discord-akairo';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;

	public override exec(message: BushMessage, command: BushCommand): any;
	public override exec(message: BushMessage | BushSlashMessage, command: BushCommand): any {
		return super.exec(message, command);
	}
}
