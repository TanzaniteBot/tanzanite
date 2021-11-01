import {
	type BushClient,
	type BushGuild,
	type BushGuildMember,
	type BushMessageManager,
	type BushNewsChannel,
	type BushTextChannel,
	type BushThreadMemberManager
} from '@lib';
import { ThreadChannel, type Collection, type Snowflake } from 'discord.js';
import { type RawThreadChannelData } from 'discord.js/typings/rawDataTypes';

export class BushThreadChannel extends ThreadChannel {
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare members: BushThreadMemberManager;
	public declare readonly client: BushClient;
	public declare readonly guildMembers: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushTextChannel | BushNewsChannel | null;
	public constructor(guild: BushGuild, data?: RawThreadChannelData, client?: BushClient, fromInteraction?: boolean) {
		super(guild, data, client, fromInteraction);
	}
}
