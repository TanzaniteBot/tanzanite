import { Task } from 'discord-akairo';
import { BushClient } from '..';

export class BushTask extends Task {
	public declare client: BushClient;
}
