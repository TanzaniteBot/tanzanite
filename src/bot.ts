import 'module-alias/register';
import 'source-map-support/register';
import config from './config/options';
import { BushClient } from './lib';

BushClient.init();
void new BushClient(config).start();
