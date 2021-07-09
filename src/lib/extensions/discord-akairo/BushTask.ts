import { Task, TaskOptions } from 'discord-akairo';
import { BushClient } from '..';

export class BushTask extends Task {
	public constructor(id: string, options?: TaskOptions) {
		super(id, options);
	}
	public declare client: BushClient;
}
