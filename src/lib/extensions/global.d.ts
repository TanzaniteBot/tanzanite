/* eslint-disable no-var */
import type { BushClient, BushClientUtil } from '#lib';
declare global {
	var client: BushClient;
	var util: BushClientUtil;
	var __rootdir__: string;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ReadonlyArray<T> {
		includes<S, R extends `${Extract<S, string>}`>(
			this: ReadonlyArray<R>,
			searchElement: S,
			fromIndex?: number
		): searchElement is R & S;
	}
}
