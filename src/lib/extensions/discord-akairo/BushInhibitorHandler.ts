import { type BushClient } from '#lib';
import { InhibitorHandler } from 'discord-akairo';

export class BushInhibitorHandler extends InhibitorHandler {
	public declare client: BushClient;
}
