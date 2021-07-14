import { BushGuildMember, BushTask } from '@lib';

export default class RemovePunishmentRole extends BushTask {
	public constructor() {
		super('removePunishmentRole', {
			delay: 30_000, // 1/2 min
			runOnStart: true
		});
	}
	async exec(): Promise<void> {
		const expiredEntries = await this.client.util.findExpiredEntries('role');
		this.client.logger.verbose(
			`RemovePunishmentRoleTask`,
			`Queried punishment roles, found <<${expiredEntries.length}>> expired punishment roles.`
		);

		for (const entry of expiredEntries) {
			const guild = this.client.guilds.cache.get(entry.guild);
			if (!guild) {
				await entry.destroy();
				continue;
			}

			const member = guild.members.cache.get(entry.user) as BushGuildMember;
			const result = await member.removePunishRole({ reason: 'Punishment expired.', role: entry.role });
			if (['success', 'failed to dm'].includes(result)) await entry.destroy();
			else throw result;

			this.client.logger.verbose(`RemovePunishmentRoleTask`, `Removed a punishment role from ${entry.user}.`);
		}
	}
}
