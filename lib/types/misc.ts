import type {
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessageCreateOptions,
	MessageEditOptions,
	MessagePayload,
	MessageReplyOptions
} from 'discord.js';

export type ReplyMessageType = string | MessagePayload | MessageReplyOptions;
export type EditMessageType = string | MessageEditOptions | MessagePayload;
export type SlashSendMessageType = string | MessagePayload | InteractionReplyOptions;
export type SlashEditMessageType = string | MessagePayload | InteractionEditReplyOptions;
export type SendMessageType = string | MessagePayload | MessageCreateOptions;
