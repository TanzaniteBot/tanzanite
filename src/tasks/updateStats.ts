import { Stat } from '#lib';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask.js';

export default class UpdateStatsTask extends BushTask {
	public constructor() {
		super('updateStats', {
			delay: 600_000, // 10 minutes
			runOnStart: true
		});
	}
	public override async exec() {
		const row =
			(await Stat.findByPk(client.config.environment)) ?? (await Stat.create({ environment: client.config.environment }));
		row.commandsUsed = client.stats.commandsUsed;
		await row.save();
	}

	public static async init(): Promise<bigint> {
		return ((await Stat.findByPk(client.config.environment)) ?? (await Stat.create({ environment: client.config.environment })))
			.commandsUsed;
	}
}
