/* eslint-disable deprecation/deprecation */
import type {
	BushCategoryChannel,
	BushClient,
	BushDMChannel,
	BushGuild,
	BushGuildBasedChannel,
	BushGuildMember,
	BushMessageManager,
	BushNewsChannel,
	BushStageChannel,
	BushStoreChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadMemberManager,
	BushVoiceBasedChannel,
	BushVoiceChannel
} from '#lib';
import { PartialGroupDMChannel, ThreadChannel, type Collection, type Snowflake } from 'discord.js';
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
	isText(): this is BushTextChannel;
	isDM(): this is BushDMChannel;
	isDMBased(): this is PartialGroupDMChannel | BushDMChannel;
	isVoice(): this is BushVoiceChannel;
	isCategory(): this is BushCategoryChannel;
	isNews(): this is BushNewsChannel;
	isStore(): this is BushStoreChannel;
	isThread(): this is BushThreadChannel;
	isStage(): this is BushStageChannel;
	isTextBased(): this is BushGuildBasedChannel & BushTextBasedChannel;
	isVoiceBased(): this is BushVoiceBasedChannel;
}
