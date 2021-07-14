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
			const role = guild?.roles?.cache?.get(entry.role);
			if (!guild || !role) {
				await entry.destroy();
				continue;
			}

			const member = guild.members.cache.get(entry.user) as BushGuildMember;
			const result = await member.removeRole({
				reason: 'Punishment expired.',
				role: role,
				addToModlog: true
			});
			if (['success', 'failed to dm'].includes(result)) await entry.destroy();
			else throw result;

			this.client.logger.verbose(`RemovePunishmentRoleTask`, `Removed a punishment role from ${entry.user}.`);
		}
	}
}
