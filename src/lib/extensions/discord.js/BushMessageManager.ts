/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, MessageManager, Snowflake } from 'discord.js';
import { BushClient, BushDMChannel, BushMessage, BushTextChannel, BushThreadChannel } from '..';

export class BushMessageManager extends MessageManager {
	public declare readonly client: BushClient;
	public declare cache: Collection<Snowflake, BushMessage>;
	public constructor(channel: BushTextChannel | BushDMChannel | BushThreadChannel, iterable?: Iterable<any>) {
		super(channel, iterable);
	}
}
