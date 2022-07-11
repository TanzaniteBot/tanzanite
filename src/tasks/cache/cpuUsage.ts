import { BushTask, Time } from '#lib';
import os from 'node:os';

export default class CpuUsageTask extends BushTask {
	public constructor() {
		super('cpuUsage', {
			delay: Time.Minute,
			runOnStart: true
		});
	}

	public async exec() {
		const cpuStats = await cpu.usage(this.client.stats.cpu === undefined ? 100 * Time.Millisecond : Time.Minute);
		this.client.stats.cpu = cpuStats;
	}
}

/* Everything inside the cpu namespace is adapted from the "node-os-utils" npm package which is licensed under a MIT license by Sunil Wang */
namespace cpu {
	export function usage(interval = Time.Second): Promise<number> {
		return new Promise((resolve) => {
			const startMeasure = average();

			setTimeout(() => {
				const endMeasure = average();
				const idleDifference = endMeasure.avgIdle - startMeasure.avgIdle;
				const totalDifference = endMeasure.avgTotal - startMeasure.avgTotal;
				const cpuPercentage = (10000 - Math.round((10000 * idleDifference) / totalDifference)) / 100;

				return resolve(cpuPercentage);
			}, interval);
		});
	}

	export function average(): CpuAverageInfo {
		let totalIdle = 0;
		let totalTick = 0;
		const cpus = os.cpus();

		for (let i = 0, len = cpus.length; i < len; i++) {
			const cpu = cpus[i];
			for (const type in cpu.times) {
				totalTick += cpu.times[type as keyof typeof cpu.times];
			}
			totalIdle += cpu.times.idle;
		}

		return {
			totalIdle: totalIdle,
			totalTick: totalTick,
			avgIdle: totalIdle / cpus.length,
			avgTotal: totalTick / cpus.length
		};
	}

	export interface CpuAverageInfo {
		totalIdle: number;
		totalTick: number;
		avgIdle: number;
		avgTotal: number;
	}
}
