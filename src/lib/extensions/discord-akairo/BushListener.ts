import { Listener } from 'discord-akairo';
import EventEmitter from 'events';
import { BushClient } from './BushClient';
export class BushListener extends Listener {
	public declare client: BushClient;
	public constructor(
		id: string,
		options: {
			emitter: string | EventEmitter;
			event: string;
			type?: 'on' | 'once' | 'prependListener' | 'prependOnceListener';
			category?: string;
		}
	) {
		super(id, options);
	}
}
