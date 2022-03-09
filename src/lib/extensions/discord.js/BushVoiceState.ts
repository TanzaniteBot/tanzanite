import type { BushClient, BushGuild, BushGuildMember, BushVoiceBasedChannel } from '#lib';
import { VoiceState } from 'discord.js';
import type { RawVoiceStateData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents the voice state for a Guild Member.
 */
export class BushVoiceState extends VoiceState {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data: RawVoiceStateData) {
		super(guild, data);
	}
}

export interface BushVoiceState extends VoiceState {
	get channel(): BushVoiceBasedChannel | null;
	get getmember(): BushGuildMember | null;
}
