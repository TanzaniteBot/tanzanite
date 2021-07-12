import { Task, TaskOptions } from 'discord-akairo';
import { BushClient } from './BushClient';

export class BushTask extends Task {
	public declare client: BushClient;
	public constructor(id: string, options?: TaskOptions) {
		super(id, options);
	}
}
