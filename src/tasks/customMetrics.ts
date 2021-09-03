import { BushTask } from '@lib';

export default class CustomMetricsTask extends BushTask {
	public constructor() {
		super('customMetrics', {
			delay: 10_000, // 10 seconds
			runOnStart: true
		});
	}
	public override async exec(): Promise<void> {
		client.metrics.guilds.set(client.guilds.cache.size);
		client.metrics.users.set(client.users.cache.size);
	}
}
