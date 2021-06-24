import { AkairoHandlerOptions, TaskHandler } from 'discord-akairo';
import { BushClient } from './BushClient';

export type BushTaskHandlerOptions = AkairoHandlerOptions;

export class BushTaskHandler extends TaskHandler {
	public constructor(client: BushClient, options: BushTaskHandlerOptions) {
		super(client, options);
	}
	declare client: BushClient;
}
