import { BushClient } from './discord-akairo/BushClient';
declare global {
	declare namespace NodeJS {
		export interface Global {
			client: BushClient;
		}
	}
	const client: BushClient;
}
