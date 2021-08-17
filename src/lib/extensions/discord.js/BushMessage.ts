/* eslint-disable @typescript-eslint/no-empty-interface */
import { Message, Partialize } from 'discord.js';
import { RawMessageData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushCommandUtil } from '../discord-akairo/BushCommandUtil';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export interface BushPartialMessage
	extends Partialize<BushMessage, 'type' | 'system' | 'pinned' | 'tts', 'content' | 'cleanContent' | 'author'> {}
export class BushMessage extends Message {
	public declare readonly client: BushClient;
	public override util!: BushCommandUtil;
	public declare readonly guild: BushGuild | null;
	public declare readonly member: BushGuildMember | null;
	public declare author: BushUser;
	public declare readonly channel: BushTextBasedChannels;
	public constructor(client: BushClient, data: RawMessageData) {
		super(client, data);
		// this.util = new BushCommandUtil(client.commandHandler, this);
	}
	public override fetch(force?: boolean): Promise<BushMessage> {
		return super.fetch(force) as Promise<BushMessage>;
	}
}
