import { performance } from 'node:perf_hooks';
performance.mark('processStart');

console.log('Tanzanite is Starting');

import * as Logger from '#lib/utils/Logger.js';
// creates proxies on console.log and console.warn
// also starts a REPL session
Logger.init();

import { config } from '#config';
import { Sentry } from '#lib/common/Sentry.js';
import { TanzaniteClient } from '#lib/extensions/discord-akairo/TanzaniteClient.js';
import { join } from 'node:path';

const isDry = process.argv.includes('dry');

process.env.PROJECT_DIR = join(import.meta.dirname, import.meta.dirname.includes('dist') ? '../..' : '..');

if (!isDry && config.credentials.sentryDsn !== null) {
	new Sentry(process.env.PROJECT_DIR, config);
}

TanzaniteClient.extendStructures();

const client = new TanzaniteClient(config);

// @ts-ignore: I don't want to add this to the global typings, this is only for debugging purposes
global.client = client;

if (!isDry) {
	await client.dbPreInit();
}

await client.init();

if (isDry) {
	process.exit(0);
} else {
	await client.start();
}
