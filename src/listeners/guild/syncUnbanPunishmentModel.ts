import { ActivePunishment, ActivePunishmentType, BotListener, Emitter, type BotClientEvents } from '#lib';

export default class SyncUnbanListener extends BotListener {
	public constructor() {
		super('syncUnbanPunishmentModel', {
			emitter: Emitter.Client,
			event: 'guildBanRemove'
		});
	}

	public async exec(...[ban]: BotClientEvents['guildBanRemove']) {
		const bans = await ActivePunishment.findAll({
			where: {
				user: ban.user.id,
				guild: ban.guild.id,
				type: ActivePunishmentType.Ban
			}
		});
		for (const dbBan of bans) {
			await dbBan.destroy();
		}
	}
}
