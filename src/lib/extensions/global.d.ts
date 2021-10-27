/* eslint-disable no-var */
import { BushClient } from './discord-akairo/BushClient';
import { BushClientUtil } from './discord-akairo/BushClientUtil';
declare global {
	var client: BushClient;
	var util: BushClientUtil;
	var __rootdir__: string;
}
