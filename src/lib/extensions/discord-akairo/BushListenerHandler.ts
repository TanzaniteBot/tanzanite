import { ListenerHandler } from 'discord-akairo';
import { BushClient } from './BushClient';

export class BushListenerHandler extends ListenerHandler {
	declare client: BushClient;
}
