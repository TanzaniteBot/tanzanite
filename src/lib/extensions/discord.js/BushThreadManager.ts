/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThreadManager } from 'discord.js';
import { BushNewsChannel, BushTextChannel } from '..';

export class BushThreadManager<AllowedThreadType> extends ThreadManager<AllowedThreadType> {
	public declare channel: BushTextChannel | BushNewsChannel;
	public constructor(channel: BushTextChannel | BushNewsChannel, iterable?: Iterable<any>) {
		super(channel, iterable);
	}
}
