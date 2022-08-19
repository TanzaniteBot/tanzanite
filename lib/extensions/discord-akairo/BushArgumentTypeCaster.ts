import { type CommandMessage } from '#lib';

export type BushArgumentTypeCaster<R = unknown> = (message: CommandMessage, phrase: string) => R;
