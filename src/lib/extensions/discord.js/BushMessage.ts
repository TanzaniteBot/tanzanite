import { If, Message, Partialize } from 'discord.js';
import { RawMessageData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushGuildTextBasedChannel, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushCommandUtil } from '../discord-akairo/BushCommandUtil';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export type PartialBushMessage = Partialize<
	BushMessage,
	'type' | 'system' | 'pinned' | 'tts',
	'content' | 'cleanContent' | 'author'
>;
export class BushMessage<Cached extends boolean = boolean> extends Message<Cached> {
	public declare readonly client: BushClient;
	public override util!: BushCommandUtil<BushMessage>;
	public declare readonly guild: BushGuild | null;
	public declare readonly member: BushGuildMember | null;
	public declare author: BushUser;
	public declare readonly channel: If<Cached, BushGuildTextBasedChannel, BushTextBasedChannels>;
	public constructor(client: BushClient, data: RawMessageData) {
		super(client, data);
		// this.util = new BushCommandUtil(client.commandHandler, this);
	}
	public override fetch(force?: boolean): Promise<BushMessage> {
		return super.fetch(force) as Promise<BushMessage>;
	}
}
