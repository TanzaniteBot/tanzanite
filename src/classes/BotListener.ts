import BotClient from '../client/BotClient';
import { Listener } from 'discord-akairo';

export class BotListener extends Listener {
	public client = <BotClient>super.client;
}
