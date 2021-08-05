/* eslint-disable @typescript-eslint/ban-types */
import { ApplicationCommand, Snowflake } from 'discord.js';
import { RawApplicationCommandData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';

export class BushApplicationCommand<PermissionsFetchType = {}> extends ApplicationCommand<PermissionsFetchType> {
	public declare readonly client: BushClient;
	public declare guild: BushGuild | null;

	public constructor(client: BushClient, data: RawApplicationCommandData, guild?: BushGuild, guildID?: Snowflake) {
		super(client, data, guild, guildID);
	}
}
