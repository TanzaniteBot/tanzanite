import { DiscordAPIError } from 'discord.js';
import { Op } from 'sequelize';
import { BotClient } from './lib/extensions/BotClient';
import { Ban } from './lib/types/Models';

export const BanTask = async (client: BotClient): Promise<void> => {
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
	client.util.devLog(`Queried bans, found ${rows.length} expired bans.`);
	for (const row of rows) {
		const guild = client.guilds.cache.get(row.guild);
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
		client.util.devLog('Unbanned user');
	}
};
