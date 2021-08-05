import { Collection, Role, Snowflake } from 'discord.js';
import { RawRoleData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushRole extends Role {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public constructor(client: BushClient, data: RawRoleData, guild: BushGuild) {
		super(client, data, guild);
	}
}
