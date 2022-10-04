import type {
	InteractionReplyOptions,
	MessageCreateOptions,
	MessageEditOptions,
	MessagePayload,
	MessageReplyOptions,
	WebhookEditMessageOptions
} from 'discord.js';

export type ReplyMessageType = string | MessagePayload | MessageReplyOptions;
export type EditMessageType = string | MessageEditOptions | MessagePayload;
export type SlashSendMessageType = string | MessagePayload | InteractionReplyOptions;
export type SlashEditMessageType = string | MessagePayload | WebhookEditMessageOptions;
export type SendMessageType = string | MessagePayload | MessageCreateOptions;
