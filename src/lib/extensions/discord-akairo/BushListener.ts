import { type BushClient } from '#lib';
import { Listener } from 'discord-akairo';
import type EventEmitter from 'events';

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
