/* eslint-disable @typescript-eslint/ban-types */
import { ThreadMember } from 'discord.js';
import { BushGuildMember, BushThreadChannel, BushUser } from '..';

export class BushThreadMember extends ThreadMember {
	public declare readonly guildMember: BushGuildMember | null;
	public declare readonly user: BushUser | null;
	public declare thread: BushThreadChannel;
	public constructor(thread: BushThreadChannel, data?: object) {
		super(thread, data);
	}
}
