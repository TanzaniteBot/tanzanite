import { BushTask, Guild, Mute } from '@lib';
import { DiscordAPIError } from 'discord.js';
import { Op } from 'sequelize';

export default class UnmuteTask extends BushTask {
	public constructor() {
		super('unmute', {
			delay: 30_000, // 1/2 min
			runOnStart: true
		});
	}
	async exec(): Promise<void> {
		const rows = await Mute.findAll({
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
		this.client.logger.verbose(`UnmuteTask`, `Queried mutes, found <<${rows.length}>> expired mutes.`);
		for (const row of rows) {
			const guild = this.client.guilds.cache.get(row.guild);
			const muteRole = (await Guild.findByPk(row.guild))?.muteRole;
			if (!guild) {
				await row.destroy();
				continue;
			}
			try {
				await (await guild.members.fetch(row.user)).roles.remove(muteRole);
			} catch (e) {
				if (e instanceof DiscordAPIError) {
					// ignore
				} else throw e;
			}
			await row.destroy();
			this.client.logger.verbose(`UnmuteTask`, `Unmuted ${row.user}`);
		}
	}
}
