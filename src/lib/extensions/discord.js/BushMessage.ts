/* eslint-disable @typescript-eslint/no-empty-interface */
import { Message, Partialize } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushDMChannel } from './BushDMChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushNewsChannel } from './BushNewsChannel';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadChannel } from './BushThreadChannel';
import { BushUser } from './BushUser';

export interface BushPartialMessage
	extends Partialize<BushMessage, 'type' | 'system' | 'pinned' | 'tts', 'content' | 'cleanContent' | 'author'> {}
export class BushMessage extends Message {
	public declare readonly client: BushClient;
	// public util: BushCommandUtil;
	public declare readonly guild: BushGuild | null;
	public declare readonly member: BushGuildMember | null;
	public declare author: BushUser;
	public declare channel: BushTextChannel | BushDMChannel | BushNewsChannel | BushThreadChannel;
	public constructor(
		client: BushClient,
		data: unknown,
		channel: BushTextChannel | BushDMChannel | BushNewsChannel | BushThreadChannel
	) {
		super(client, data, channel);
		// this.util = new BushCommandUtil(client.commandHandler, this);
	}
	public override fetch(force?: boolean): Promise<BushMessage> {
		return super.fetch(force) as Promise<BushMessage>;
	}
}
