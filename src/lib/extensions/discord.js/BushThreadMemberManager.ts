/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { Snowflake, ThreadMemberManager, UserResolvable } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuildMember } from './BushGuildMember';
import { BushMessage } from './BushMessage';
import { BushThreadChannel } from './BushThreadChannel';
import { BushThreadMember } from './BushThreadMember';
import { BushUser } from './BushUser';

export type BushThreadMemberResolvable = BushThreadMember | UserResolvable;
export type BushUserResolvable = BushUser | Snowflake | BushMessage | BushGuildMember | BushThreadMember;

export interface BushThreadMemberManager extends ThreadMemberManager {}

export class BushThreadMemberManager extends ThreadMemberManager {
	public declare thread: BushThreadChannel;
	public declare readonly client: BushClient;

	constructor(thread: BushThreadChannel, iterable?: Iterable<any>) {
		super(thread, iterable);
	}
}
