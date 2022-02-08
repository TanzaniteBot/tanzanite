import { type BushClient } from '#lib';
import { ListenerHandler } from 'discord-akairo';

export class BushListenerHandler extends ListenerHandler {
	public declare client: BushClient;
}
