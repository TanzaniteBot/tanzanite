import { Collection, Role, Snowflake } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushRole extends Role {
	public declare readonly client: BushClient;
	public guild: BushGuild;
	public readonly members: Collection<Snowflake, BushGuildMember>;
	public constructor(client: BushClient, data: unknown, guild: BushGuild) {
		super(client, data, guild);
	}
}
