import { VoiceState } from 'discord.js';
import { BushGuild, BushGuildMember, BushStageChannel, BushVoiceChannel } from '..';

export class BushVoiceState extends VoiceState {
	public readonly channel: BushVoiceChannel | BushStageChannel | null;
	public guild: BushGuild;
	public readonly member: BushGuildMember | null;
	public constructor(guild: BushGuild, data: unknown) {
		super(guild, data);
	}
}
