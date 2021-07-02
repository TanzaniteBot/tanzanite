import * as config from './config/options';
import { BushClient } from './lib/extensions/discord-akairo/BushClient';

BushClient.preStart();
const client: BushClient = new BushClient(config);
client.start();
