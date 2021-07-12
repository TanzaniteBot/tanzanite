import { Listener } from 'discord-akairo';
import { BushClient } from './BushClient';

export class BushListener extends Listener {
	public declare client: BushClient;
}
