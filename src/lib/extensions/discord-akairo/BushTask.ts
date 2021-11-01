import { type BushClient } from '#lib';
import { Task, type TaskOptions } from 'discord-akairo';

export class BushTask extends Task {
	public declare client: BushClient;
	public constructor(id: string, options: TaskOptions) {
		super(id, options);
	}
}
