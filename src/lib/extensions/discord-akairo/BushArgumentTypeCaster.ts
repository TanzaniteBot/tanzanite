import { BushMessage } from '../discord.js/BushMessage';

export type BushArgumentTypeCaster = (message: BushMessage, phrase: string) => any;
