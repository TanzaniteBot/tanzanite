import { BushTask } from '@lib';
import * as osu from 'node-os-utils';

export default class CpuUsageTask extends BushTask {
	public constructor() {
		super('cpuUsage', {
			delay: 60_000, // 1 minute
			runOnStart: true
		});
	}
	public override async exec() {
		const cpu = await osu.cpu.usage(client.stats.cpu === undefined ? 100 : 60_000);
		client.stats.cpu = cpu;
	}
}
