import { dirname } from 'path';
import 'source-map-support/register.js';
import { fileURLToPath } from 'url';
import config from './config/options.js';
import { Sentry } from './lib/common/Sentry.js';
import { BushClient } from './lib/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
global.__rootdir__ = __dirname || process.cwd();
new Sentry();
BushClient.init();
void new BushClient(config).start();
