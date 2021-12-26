import type { BushClient, BushGuild, BushGuildMember } from '#lib';
import { Role, type Collection, type Snowflake } from 'discord.js';
import type { RawRoleData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a role on Discord.
 */
export class BushRole extends Role {
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;

	public constructor(client: BushClient, data: RawRoleData, guild: BushGuild) {
		super(client, data, guild);
	}
}
