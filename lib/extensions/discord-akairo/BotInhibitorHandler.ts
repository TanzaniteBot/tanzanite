import { InhibitorHandler } from '@notenoughupdates/discord-akairo';
import { TanzaniteClient } from './TanzaniteClient.js';

export class BotInhibitorHandler extends InhibitorHandler {
	public declare readonly client: TanzaniteClient;
}
