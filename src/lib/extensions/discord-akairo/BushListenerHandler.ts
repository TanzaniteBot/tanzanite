import { type BushClient } from '#lib';
import { ListenerHandler } from 'discord-akairo';

export class BushListenerHandler extends ListenerHandler {
	declare client: BushClient;
}
