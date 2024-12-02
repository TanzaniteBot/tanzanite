import { InhibitorHandler } from '@tanzanite/discord-akairo';
import type { TanzaniteClient } from './TanzaniteClient.js';

export class BotInhibitorHandler extends InhibitorHandler {
	declare public readonly client: TanzaniteClient;
}
