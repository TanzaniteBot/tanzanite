import type { BushGuildMember, BushThreadChannel, BushUser } from '#lib';
import { ThreadMember } from 'discord.js';
import type { RawThreadMemberData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a Member for a Thread.
 */
export class BushThreadMember extends ThreadMember {
	public declare thread: BushThreadChannel;

	public constructor(thread: BushThreadChannel, data?: RawThreadMemberData) {
		super(thread, data);
	}
}

export interface BushThreadMember extends ThreadMember {
	get guildMember(): BushGuildMember | null;
	get user(): BushUser | null;
}
