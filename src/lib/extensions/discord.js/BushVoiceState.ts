import { VoiceState } from 'discord.js';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushStageChannel } from './BushStageChannel';
import { BushVoiceChannel } from './BushVoiceChannel';

export class BushVoiceState extends VoiceState {
	public declare readonly channel: BushVoiceChannel | BushStageChannel | null;
	public declare guild: BushGuild;
	public declare readonly member: BushGuildMember | null;
	public constructor(guild: BushGuild, data: unknown) {
		super(guild, data);
	}
}
