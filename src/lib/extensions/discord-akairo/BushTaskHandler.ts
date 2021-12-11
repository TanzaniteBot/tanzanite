import { type BushClient } from '#lib';
import { TaskHandler, type AkairoHandlerOptions } from 'discord-akairo';

export type BushTaskHandlerOptions = AkairoHandlerOptions;

export class BushTaskHandler extends TaskHandler {
	public declare client: BushClient;

	public constructor(client: BushClient, options: BushTaskHandlerOptions) {
		super(client, options);
	}
}
