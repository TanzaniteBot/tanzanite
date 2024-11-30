import { TaskHandler } from '@tanzanite/discord-akairo';
import type { TanzaniteClient } from './index.js';

export class BotTaskHandler extends TaskHandler {
	declare public readonly client: TanzaniteClient;
}
