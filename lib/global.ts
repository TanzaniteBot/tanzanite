/* eslint-disable */

declare const nodeFetch: typeof import('node-fetch').default;

declare global {
	interface ReadonlyArray<T> {
		includes<S, R extends `${Extract<S, string>}`>(
			this: ReadonlyArray<R>,
			searchElement: S,
			fromIndex?: number
		): searchElement is R & S;
	}

	var fetch: typeof nodeFetch;
}

export {};
