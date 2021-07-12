import 'module-alias/register';
import * as config from './config/options';
import { BushClient } from './lib/';

BushClient.preStart();
const client: BushClient = new BushClient(config);
client.start();
