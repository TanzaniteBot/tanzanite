/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationCommand, Snowflake } from 'discord.js';
import { BushClient, BushGuild } from '..';

export class BushApplicationCommand<PermissionsFetchType = {}> extends ApplicationCommand {
	public declare readonly client: BushClient;
	public guild: BushGuild | null;

	public constructor(client: BushClient, data: unknown, guild?: BushGuild, guildID?: Snowflake) {
		super(client, data, guild, guildID);
	}
}
