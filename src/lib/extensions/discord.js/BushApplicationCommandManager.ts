/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationCommandManager, ApplicationCommandPermissionsManager, GuildResolvable, Snowflake } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushGuildResolvable } from './BushCommandInteraction';

export type BushApplicationCommandResolvable = BushApplicationCommand | Snowflake;

export class BushApplicationCommandManager<
	ApplicationCommandType = BushApplicationCommand<{ guild: BushGuildResolvable }>,
	PermissionsOptionsExtras = { guild: GuildResolvable },
	PermissionsGuildType = null
> extends ApplicationCommandManager<ApplicationCommandType, PermissionsOptionsExtras, PermissionsGuildType> {
	public permissions: ApplicationCommandPermissionsManager<
		{ command?: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		{ command: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		PermissionsGuildType,
		null
	>;

	public constructor(client: BushClient, iterable?: Iterable<any>) {
		super(client, iterable);
	}
}
