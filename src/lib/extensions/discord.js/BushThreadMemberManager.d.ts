/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { CachedManager, Collection, Snowflake, ThreadChannel, ThreadMember, UserResolvable } from 'discord.js';
import { BushClient, BushThreadMemberResolvable } from '../discord-akairo/BushClient';
import { BushThreadChannel } from './BushThreadChannel';
import { BushThreadMember } from './BushThreadMember';

export class BushThreadMemberManager extends CachedManager<Snowflake, BushThreadMember, BushThreadMemberResolvable> {
	public constructor(thread: BushThreadChannel, iterable?: Iterable<unknown>);
	public declare readonly client: BushClient;
	public thread: ThreadChannel;
	public add(member: UserResolvable | '@me', reason?: string): Promise<Snowflake>;
	public fetch(cache?: boolean): Promise<Collection<Snowflake, ThreadMember>>;
	public remove(id: Snowflake | '@me', reason?: string): Promise<Snowflake>;
}
