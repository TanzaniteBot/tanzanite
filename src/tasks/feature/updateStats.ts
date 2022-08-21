import { BushTask, Stat, Time } from '#lib';

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
}
