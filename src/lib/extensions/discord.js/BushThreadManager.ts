/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThreadManager } from 'discord.js';
import { BushNewsChannel } from './BushNewsChannel';
import { BushTextChannel } from './BushTextChannel';

export class BushThreadManager extends ThreadManager {
	public declare channel: BushTextChannel | BushNewsChannel;
	public constructor(channel: BushTextChannel | BushNewsChannel, iterable?: Iterable<any>) {
		super(channel, iterable);
	}
}
