import { BushTask, Time } from '#lib';
import { cpu } from 'node-os-utils';

export default class CpuUsageTask extends BushTask {
	public constructor() {
		super('cpuUsage', {
			delay: Time.Minute,
			runOnStart: true
		});
	}

	public async exec() {
		const cpuStats = await cpu.usage(client.stats.cpu === undefined ? 100 * Time.Millisecond : Time.Minute);
		client.stats.cpu = cpuStats;
	}
}
