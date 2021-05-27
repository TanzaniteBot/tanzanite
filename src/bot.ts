import { BushClient } from './lib/extensions/BushClient';
import * as config from './config/options';

const client: BushClient = new BushClient(config);
client.start();
