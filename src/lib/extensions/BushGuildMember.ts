import { GuildMember } from 'discord.js';
import { BushGuild } from './BushGuild';

export interface BushGuildMember extends GuildMember {
	guild: BushGuild;
}
