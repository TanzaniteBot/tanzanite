import { BushClient } from './discord-akairo/BushClient';
declare global {
	namespace NodeJS {
		export interface Global {
			client: BushClient;
		}
	}
	const client: BushClient;
}
