import { BushClient } from './discord-akairo/BushClient';
import { BushClientUtil } from './discord-akairo/BushClientUtil';
declare global {
	namespace NodeJS {
		export interface Global {
			client: BushClient;
			util: BushClientUtil;
		}
	}
	const client: BushClient;
	const util: BushClientUtil;
}
