/* eslint-disable @typescript-eslint/no-explicit-any */
import { GuildApplicationCommandManager } from 'discord.js';
import { BushGuild } from './BushGuild';

export class BushGuildApplicationCommandManager extends GuildApplicationCommandManager {
	public declare guild: BushGuild;
	public constructor(guild: BushGuild, iterable?: Iterable<any>) {
		super(guild, iterable);
	}
}
