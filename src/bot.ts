import 'module-alias/register';
import 'source-map-support/register';
import config from './config/options';
import { BushClient } from './lib';
import { Sentry } from './lib/common/Sentry';

global.__rootdir__ = __dirname || process.cwd();
new Sentry();
BushClient.init();
void new BushClient(config).start();
