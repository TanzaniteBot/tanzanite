import { BushTask, Stat, Time } from '#lib';

export default class UpdateStatsTask extends BushTask {
	public constructor() {
		super('updateStats', {
			delay: 10 * Time.Minute,
			runOnStart: true
		});
	}

	public override async exec() {
		const row =
			(await Stat.findByPk(client.config.environment)) ?? (await Stat.create({ environment: client.config.environment }));
		row.commandsUsed = client.stats.commandsUsed;
		row.slashCommandsUsed = client.stats.slashCommandsUsed;
		await row.save();
	}

	public static async init(): Promise<{ commandsUsed: bigint; slashCommandsUsed: bigint }> {
		const temp =
			(await Stat.findByPk(client.config.environment)) ?? (await Stat.create({ environment: client.config.environment }));
		return { commandsUsed: temp.commandsUsed, slashCommandsUsed: temp.slashCommandsUsed };
	}
}
