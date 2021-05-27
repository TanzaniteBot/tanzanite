import chalk from 'chalk';
import { DiscordAPIError } from 'discord.js';
import { Op } from 'sequelize';
import { BushTask } from '../lib/extensions/BushTask';
import { Ban } from '../lib/models';

export default class UnbanTask extends BushTask {
	constructor() {
		super('unban', {
			delay: 30_000, // 1/2 min
			runOnStart: true
		});
	}
	async exec(): Promise<void> {
		const rows = await Ban.findAll({
			where: {
				[Op.and]: [
					{
						expires: {
							[Op.lt]: new Date() // Find all rows with an expiry date before now
						}
					}
				]
			}
		});
		this.client.logger.verbose(
			chalk.cyan(`Queried bans, found ${rows.length} expired bans.`)
		);
		for (const row of rows) {
			const guild = this.client.guilds.cache.get(row.guild);
			if (!guild) {
				await row.destroy();
				continue;
			}
			try {
				await guild.members.unban(
					row.user,
					`Unbanning user because tempban expired`
				);
			} catch (e) {
				if (e instanceof DiscordAPIError) {
					// Member not banned, ignore
				} else throw e;
			}
			await row.destroy();
			this.client.logger.verbose(chalk.cyan('Unbanned user'));
		}
	}
}
