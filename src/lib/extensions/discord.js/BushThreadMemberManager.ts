/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ThreadMemberManager } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushThreadChannel } from './BushThreadChannel';

export interface BushThreadMemberManager extends ThreadMemberManager {}

export class BushThreadMemberManager extends ThreadMemberManager {
	public declare thread: BushThreadChannel;
	public declare readonly client: BushClient;

	public constructor(thread: BushThreadChannel, iterable?: Iterable<any>) {
		super(thread, iterable);
	}
}
