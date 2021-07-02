/* eslint-disable @typescript-eslint/ban-types */
import { Collection, Snowflake, ThreadChannel } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushMessageManager } from './BushMessageManager';
import { BushNewsChannel } from './BushNewsChannel';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadMemberManager } from './BushThreadMemberManager';

export class BushThreadChannel extends ThreadChannel {
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare members: BushThreadMemberManager;

	public declare readonly client: BushClient;
	public declare readonly guildMembers: Collection<Snowflake, BushGuildMember>;

	public declare readonly parent: BushTextChannel | BushNewsChannel | null;
	public constructor(guild: BushGuild, data?: object) {
		super(guild, data);
	}
}
