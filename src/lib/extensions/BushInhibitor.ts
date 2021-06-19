import { Inhibitor } from 'discord-akairo';
import { BushClient } from './BushClient';

export class BushInhibitor extends Inhibitor {
	public declare client: BushClient;
}
