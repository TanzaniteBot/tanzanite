import { Listener } from 'discord-akairo';
import { BushClient } from '..';

export class BushListener extends Listener {
	public declare client: BushClient;
}
