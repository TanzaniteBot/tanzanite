/* eslint-disable @typescript-eslint/ban-types */
import type { BushClient, BushGuild } from '#lib';
import { ApplicationCommand, type Snowflake } from 'discord.js';
import type { RawApplicationCommandData } from 'discord.js/typings/rawDataTypes';

export class BushApplicationCommand<PermissionsFetchType = {}> extends ApplicationCommand<PermissionsFetchType> {
	public declare readonly client: BushClient;
	public declare guild: BushGuild | null;

	public constructor(client: BushClient, data: RawApplicationCommandData, guild?: BushGuild, guildID?: Snowflake) {
		super(client, data, guild, guildID);
	}
}
