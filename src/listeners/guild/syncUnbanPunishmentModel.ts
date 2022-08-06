import { ActivePunishment, ActivePunishmentType, BushListener, type BushClientEvents } from '#lib';

export default class SyncUnbanListener extends BushListener {
	public constructor() {
		super('syncUnbanPunishmentModel', {
			emitter: 'client',
			event: 'guildBanRemove',
			category: 'guild'
		});
	}

	public async exec(...[ban]: BushClientEvents['guildBanRemove']) {
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
