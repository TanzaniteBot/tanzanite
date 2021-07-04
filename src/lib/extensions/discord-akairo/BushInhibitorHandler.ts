import { InhibitorHandler } from 'discord-akairo';
import { BushClient } from './BushClient';

export class BushInhibitorHandler extends InhibitorHandler {
	public declare client: BushClient;
}
