import { AkairoHandlerOptions, TaskHandler } from 'discord-akairo';
import { BushClient } from './BushClient';

export interface BushTaskHandlerOptions extends AkairoHandlerOptions {}

export class BushTaskHandler extends TaskHandler {
	public constructor(client: BushClient, options: BushTaskHandlerOptions) {
		super(client, options);
		this.client;
	}
	declare client: BushClient;
}
