import { Presence } from 'discord.js';
import { BushClient, BushGuild, BushGuildMember, BushUser } from '..';

export class BushPresence extends Presence {
	public declare guild: BushGuild | null;
	public declare readonly member: BushGuildMember | null;
	public declare readonly user: BushUser | null;

	public constructor(client: BushClient, data?: unknown) {
		super(client, data);
	}
}
