import { ClientEvents } from 'discord.js';
import { BushMessage, BushPartialMessage } from './BushMessage';

export interface BushClientEvents extends ClientEvents {
	messageCreate: [message: BushMessage];
	messageUpdate: [oldMessage: BushMessage | BushPartialMessage, newMessage: BushMessage | BushPartialMessage];
}
