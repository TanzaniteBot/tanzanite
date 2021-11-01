import type { BushClient, BushGuild, BushGuildMember, BushUser } from '#lib';
import { Presence } from 'discord.js';
import type { RawPresenceData } from 'discord.js/typings/rawDataTypes';

export class BushPresence extends Presence {
	public declare guild: BushGuild | null;
	public declare readonly member: BushGuildMember | null;
	public declare readonly user: BushUser | null;

	public constructor(client: BushClient, data?: RawPresenceData) {
		super(client, data);
	}
}
