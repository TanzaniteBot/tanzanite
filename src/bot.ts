import { token, owners } from './config';
import MBClient from './client/BotClient';

const client: MBClient = new MBClient({token, owners});
client.start();