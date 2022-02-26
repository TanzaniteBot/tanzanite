import type { BushClient, BushGuild, BushGuildMember, BushUser } from '#lib';
import { Presence } from 'discord.js';
import type { RawPresenceData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a user's presence.
 */
export class BushPresence extends Presence {
	public declare guild: BushGuild | null;

	public constructor(client: BushClient, data?: RawPresenceData) {
		super(client, data);
	}
}

export interface BushPresence {
	get member(): BushGuildMember | null;
	get user(): BushUser | null;
}
