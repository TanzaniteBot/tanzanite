/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, MessageManager, Snowflake } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushDMChannel } from './BushDMChannel';
import { BushMessage } from './BushMessage';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadChannel } from './BushThreadChannel';

export class BushMessageManager extends MessageManager {
	public declare readonly client: BushClient;
	public declare cache: Collection<Snowflake, BushMessage>;
	public constructor(channel: BushTextChannel | BushDMChannel | BushThreadChannel, iterable?: Iterable<any>) {
		super(channel, iterable);
	}
}