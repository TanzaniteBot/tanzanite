import { ActivePunishment, ActivePunishmentType, BushListener } from '@lib';
import { ClientEvents } from 'discord.js';

export default class SyncUnbanListener extends BushListener {
	public constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove'
		});
	}

	public override async exec(...[ban]: ClientEvents['guildBanRemove']): Promise<void> {
		const bans = await ActivePunishment.findAll({
			where: {
				user: ban.user.id,
				guild: ban.guild.id,
				type: ActivePunishmentType.BAN
			}
		});
		for (const dbBan of bans) {
			await dbBan.destroy();
		}
	}
}
