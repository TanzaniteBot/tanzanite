import type { CommandMessage } from '#lib';

export type BotArgumentTypeCaster<R = unknown> = (message: CommandMessage, phrase: string) => R;
