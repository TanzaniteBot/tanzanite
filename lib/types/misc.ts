import type {
	InteractionReplyOptions,
	MessageEditOptions,
	MessageOptions,
	MessagePayload,
	ReplyMessageOptions,
	WebhookEditMessageOptions
} from 'discord.js';

export type ReplyMessageType = string | MessagePayload | ReplyMessageOptions;
export type EditMessageType = string | MessageEditOptions | MessagePayload;
export type SlashSendMessageType = string | MessagePayload | InteractionReplyOptions;
export type SlashEditMessageType = string | MessagePayload | WebhookEditMessageOptions;
export type SendMessageType = string | MessagePayload | MessageOptions;
