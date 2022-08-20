import { init } from '../lib/utils/BushLogger.js';
// creates proxies on console.log and console.warn
// also starts a REPL session
init();

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { default as config } from '../config/options.js';
import { Sentry } from '../lib/common/Sentry.js';
import { BushClient } from '../lib/extensions/discord-akairo/BushClient.js';

const isDry = process.argv.includes('dry');
if (!isDry && config.credentials.sentryDsn !== null) new Sentry(dirname(fileURLToPath(import.meta.url)) || process.cwd(), config);
BushClient.extendStructures();
const client = new BushClient(config);
if (!isDry) await client.dbPreInit();
await client.init();
if (isDry) {
	await client.destroy();
	process.exit(0);
} else {
	await client.start();
}
