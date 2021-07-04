import { InhibitorHandler } from 'discord-akairo';
import { BushClient } from '..';

export class BushInhibitorHandler extends InhibitorHandler {
	public declare client: BushClient;
}
