import { parse, stringify } from 'json5';
import { BushClient } from './discord-akairo/BushClient';
import { BushClientUtil } from './discord-akairo/BushClientUtil';
declare global {
	type JSON5 = { parse: typeof parse; stringify: typeof stringify };
	namespace NodeJS {
		export interface Global {
			client: BushClient;
			util: BushClientUtil;
			JSON5: JSON5;
		}
	}
	const client: BushClient;
	const util: BushClientUtil;
	const JSON5: JSON5;
}
