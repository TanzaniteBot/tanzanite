import { type BushMessage } from '#lib';

export type BushArgumentTypeCaster = (message: BushMessage, phrase: string) => any;
