import { BushTask, Stat, Time } from '#lib';
import { Client } from 'discord.js';

export default class UpdateStatsTask extends BushTask {
	public constructor() {
		super('updateStats', {
			delay: 10 * Time.Minute,
			runOnStart: true
		});
	}

	public async exec() {
		const row =
			(await Stat.findByPk(this.client.config.environment)) ??
			(await Stat.create({ environment: this.client.config.environment }));
		row.commandsUsed = this.client.stats.commandsUsed;
		row.slashCommandsUsed = this.client.stats.slashCommandsUsed;
		await row.save();
	}

	public static async init(client: Client): Promise<{ commandsUsed: bigint; slashCommandsUsed: bigint }> {
		const temp =
			(await Stat.findByPk(client.config.environment)) ?? (await Stat.create({ environment: client.config.environment }));
		return { commandsUsed: temp.commandsUsed, slashCommandsUsed: temp.slashCommandsUsed };
	}
}
