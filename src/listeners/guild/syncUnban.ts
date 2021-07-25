import { ActivePunishment, ActivePunishmentType, BushListener } from '@lib';
import { ClientEvents } from 'discord.js';

export default class SyncUnbanListener extends BushListener {
	public constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove'
		});
	}

	public async exec(...[ban]: ClientEvents['guildBanRemove']): Promise<void> {
		const bans = await ActivePunishment.findAll({
			where: {
				user: ban.user,
				guild: ban.guild,
				type: ActivePunishmentType.BAN
			}
		});
		for (const dbBan of bans) {
			await dbBan.destroy();
		}
	}
}
