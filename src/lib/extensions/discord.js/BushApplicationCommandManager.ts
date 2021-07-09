/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationCommandManager, GuildResolvable, Snowflake } from 'discord.js';
import { BushApplicationCommand, BushApplicationCommandPermissionsManager, BushClient, BushGuildResolvable } from '..';

export type BushApplicationCommandResolvable = BushApplicationCommand | Snowflake;

export class BushApplicationCommandManager<
	ApplicationCommandType = BushApplicationCommand<{ guild: BushGuildResolvable }>,
	PermissionsOptionsExtras = { guild: GuildResolvable },
	PermissionsGuildType = null
> extends ApplicationCommandManager<ApplicationCommandType, PermissionsOptionsExtras, PermissionsGuildType> {
	public permissions: BushApplicationCommandPermissionsManager<
		{ command?: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		{ command: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		PermissionsOptionsExtras,
		PermissionsGuildType,
		null
	>;

	public constructor(client: BushClient, iterable?: Iterable<any>) {
		super(client, iterable);
	}
}
