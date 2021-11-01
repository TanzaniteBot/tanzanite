/* eslint-disable no-var */
import type { BushClient, BushClientUtil } from '#lib';
declare global {
	var client: BushClient;
	var util: BushClientUtil;
	var __rootdir__: string;
}
