import { AllowedThreadTypeForTextChannel, BaseGuildTextChannel, Collection, Snowflake } from 'discord.js';
import { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';
import { BushCategoryChannel, BushClient, BushGuildMember } from '../..';
import { BushGuild } from './BushGuild';
import { BushMessageManager } from './BushMessageManager';
import { BushThreadManager } from './BushThreadManager';

export class BushBaseGuildTextChannel extends BaseGuildTextChannel {
	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient, immediatePatch?: boolean) {
		super(guild, data, client, immediatePatch);
	}
	public declare messages: BushMessageManager;
	public declare threads: BushThreadManager<AllowedThreadTypeForTextChannel>;
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushCategoryChannel | null;
}
