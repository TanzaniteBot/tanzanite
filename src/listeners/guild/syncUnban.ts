import { ActivePunishment, ActivePunishmentType, BushClientEvents, BushListener } from '@lib';

export default class SyncUnbanListener extends BushListener {
	public constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove',
			category: 'guild'
		});
	}

	public override async exec(...[ban]: BushClientEvents['guildBanRemove']) {
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
