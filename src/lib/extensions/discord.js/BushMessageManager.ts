/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, MessageManager, Snowflake } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushDMChannel } from './BushDMChannel';
import { BushMessage } from './BushMessage';
import { BushTextChannel } from './BushTextChannel';

export class BushMessageManager extends MessageManager {
	public declare readonly client: BushClient;
	public declare cache: Collection<Snowflake, BushMessage>;
	constructor(channel: BushTextChannel | BushDMChannel, iterable?: Iterable<any>) {
		super(channel, iterable);
	}
}
