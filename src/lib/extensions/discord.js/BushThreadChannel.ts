import type {
	BushBaseGuildVoiceChannel,
	BushClient,
	BushGuild,
	BushGuildMember,
	BushMessageManager,
	BushNewsChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadMemberManager
} from '#lib';
import { ThreadChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawThreadChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a thread channel on Discord.
 */
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

export interface BushThreadChannel extends ThreadChannel {
	isText(): this is BushTextBasedChannel;
	isVoice(): this is BushBaseGuildVoiceChannel;
	isThread(): this is BushThreadChannel;
}
