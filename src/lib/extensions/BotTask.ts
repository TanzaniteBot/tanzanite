import { Task } from 'discord-akairo';
import { BotClient } from './BotClient';

export class BotTask extends Task {
	public client: BotClient;
}