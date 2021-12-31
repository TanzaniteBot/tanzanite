import type {
	BushClient,
	BushCommandUtil,
	BushGuild,
	BushGuildMember,
	BushGuildTextBasedChannel,
	BushMessageReaction,
	BushTextBasedChannel,
	BushThreadChannel,
	BushUser
} from '#lib';
import {
	Message,
	type EmojiIdentifierResolvable,
	type If,
	type MessageActionRowComponent,
	type MessageEditOptions,
	type MessagePayload,
	type Partialize,
	type ReplyMessageOptions,
	type StartThreadOptions
} from 'discord.js';
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
	delete(): Promise<BushMessage>;
	edit(content: string | MessageEditOptions | MessagePayload): Promise<BushMessage>;
	equals(message: BushMessage, rawData: unknown): boolean;
	fetchReference(): Promise<BushMessage>;
	crosspost(): Promise<BushMessage>;
	fetch(force?: boolean): Promise<BushMessage>;
	pin(): Promise<BushMessage>;
	react(emoji: EmojiIdentifierResolvable): Promise<BushMessageReaction>;
	removeAttachments(): Promise<BushMessage>;
	reply(options: string | MessagePayload | ReplyMessageOptions): Promise<BushMessage>;
	resolveComponent(customId: string): MessageActionRowComponent | null;
	startThread(options: StartThreadOptions): Promise<BushThreadChannel>;
	suppressEmbeds(suppress?: boolean): Promise<BushMessage>;
	unpin(): Promise<BushMessage>;
	inGuild(): this is BushMessage<true> & this;
}
