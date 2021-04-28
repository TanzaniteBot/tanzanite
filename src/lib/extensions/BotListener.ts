import { Listener } from 'discord-akairo';
import { BotClient } from './BotClient';

export class BotListener extends Listener {
	public client: BotClient;
}
