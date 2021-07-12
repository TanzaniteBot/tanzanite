import { Presence } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushPresence extends Presence {
	public declare guild: BushGuild | null;
	public declare readonly member: BushGuildMember | null;
	public declare readonly user: BushUser | null;

	public constructor(client: BushClient, data?: unknown) {
		super(client, data);
	}
}
