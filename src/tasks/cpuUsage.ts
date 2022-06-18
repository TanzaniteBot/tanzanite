import { BushTask, Time } from '#lib';
import osu from 'node-os-utils';

export default class CpuUsageTask extends BushTask {
	public constructor() {
		super('cpuUsage', {
			delay: Time.Minute,
			runOnStart: true
		});
	}

	public async exec() {
		const cpuStats = await osu.cpu.usage(this.client.stats.cpu === undefined ? 100 * Time.Millisecond : Time.Minute);
		this.client.stats.cpu = cpuStats;
	}
}
