import { type BushGuildMember, type BushThreadChannel, type BushUser } from '@lib';
import { ThreadMember } from 'discord.js';
import { type RawThreadMemberData } from 'discord.js/typings/rawDataTypes';

export class BushThreadMember extends ThreadMember {
	public declare readonly guildMember: BushGuildMember | null;
	public declare readonly user: BushUser | null;
	public declare thread: BushThreadChannel;
	public constructor(thread: BushThreadChannel, data?: RawThreadMemberData) {
		super(thread, data);
	}
}
