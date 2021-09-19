/* eslint-disable no-var */
import { parse, stringify } from 'json5';
import { BushClient } from './discord-akairo/BushClient';
import { BushClientUtil } from './discord-akairo/BushClientUtil';
type JSON5 = { parse: typeof parse; stringify: typeof stringify };
declare global {
	var client: BushClient;
	var util: BushClientUtil;
	var JSON5: JSON5;
}
