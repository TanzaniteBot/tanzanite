import { type BushMessage } from '#lib';

export type BushArgumentTypeCaster<R = unknown> = (message: BushMessage, phrase: string) => R;
