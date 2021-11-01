import { type BushGuild, type BushGuildMember, type BushStageChannel, type BushVoiceChannel } from '@lib';
import { VoiceState } from 'discord.js';
import { type RawVoiceStateData } from 'discord.js/typings/rawDataTypes';

export class BushVoiceState extends VoiceState {
	// public declare readonly client: BushClient;
	public declare readonly channel: BushVoiceChannel | BushStageChannel | null;
	public declare guild: BushGuild;
	public declare readonly member: BushGuildMember | null;
	public constructor(guild: BushGuild, data: RawVoiceStateData) {
		super(guild, data);
	}
}
