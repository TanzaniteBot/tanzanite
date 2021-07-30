import { ClientEvents } from 'discord.js';
import { BushMessage } from './BushMessage';

export interface BushClientEvents extends ClientEvents {
	messageCreate: [message: BushMessage];
}
