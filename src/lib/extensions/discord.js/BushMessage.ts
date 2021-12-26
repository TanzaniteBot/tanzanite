import type {
	BushClient,
	BushCommandUtil,
	BushGuild,
	BushGuildMember,
	BushGuildTextBasedChannel,
	BushTextBasedChannel,
	BushUser
} from '#lib';
import { Message, type If, type Partialize } from 'discord.js';
import type { RawMessageData } from 'discord.js/typings/rawDataTypes';

export type PartialBushMessage = Partialize<
	BushMessage,
	'type' | 'system' | 'pinned' | 'tts',
	'content' | 'cleanContent' | 'author'
>;

/**
 * Represents a message on Discord.
 */
export class BushMessage<Cached extends boolean = boolean> extends Message<Cached> {
	public declare readonly client: BushClient;
	public declare util: BushCommandUtil<BushMessage<true>>;
	public declare readonly guild: If<Cached, BushGuild>;
	public declare readonly member: BushGuildMember | null;
	public declare author: BushUser;
	public declare readonly channel: If<Cached, BushGuildTextBasedChannel, BushTextBasedChannel>;

	public constructor(client: BushClient, data: RawMessageData) {
		super(client, data);
	}
}

export interface BushMessage<Cached extends boolean = boolean> extends Message<Cached> {
	fetch(force?: boolean): Promise<BushMessage>;
}
