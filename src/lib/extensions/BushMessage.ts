import { DMChannel, NewsChannel } from 'discord.js';
import { Message } from 'discord.js';
import { BushGuildMember } from './BushGuildMember';
import { BushTextChannel } from './BushTextChannel';

export interface BushMessage extends Message {
	member: BushGuildMember;
	channel: BushTextChannel | DMChannel | NewsChannel;
}
