import { ListenerHandler } from 'discord-akairo';
import { BushClient } from '..';

export class BushListenerHandler extends ListenerHandler {
	declare client: BushClient;
}
