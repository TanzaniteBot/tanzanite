import { BushTask, Time } from '#lib';
import osu from 'node-os-utils';

export default class CpuUsageTask extends BushTask {
	public constructor() {
		super('cpuUsage', {
			delay: Time.Minute,
			runOnStart: true
		});
	}

	public override async exec() {
		const cpu = await osu.cpu.usage(client.stats.cpu === undefined ? 100 * Time.Millisecond : Time.Minute);
		client.stats.cpu = cpu;
	}
}
