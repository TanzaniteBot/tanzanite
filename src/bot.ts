import { dirname } from 'path';
import 'source-map-support/register.js';
import { fileURLToPath } from 'url';
import config from './config/options.js';
import { Sentry } from './lib/common/Sentry.js';
import { BushClient } from './lib/index.js';

const isDry = process.argv.includes('dry');
if (!isDry) new Sentry(dirname(fileURLToPath(import.meta.url)) || process.cwd());
BushClient.extendStructures();
const client = new BushClient(config);
await client.init();
if (isDry) {
	await client.destroy();
	process.exit(0);
} else {
	await client.start();
}
