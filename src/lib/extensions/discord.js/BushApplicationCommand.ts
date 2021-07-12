/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationCommand, Snowflake } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';

export class BushApplicationCommand<PermissionsFetchType = {}> extends ApplicationCommand {
	public declare readonly client: BushClient;
	public declare guild: BushGuild | null;

	public constructor(client: BushClient, data: unknown, guild?: BushGuild, guildID?: Snowflake) {
		super(client, data, guild, guildID);
	}
}
