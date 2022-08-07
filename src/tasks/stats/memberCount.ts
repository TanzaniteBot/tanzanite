import { BushTask, MemberCount, Time } from '#lib';
import assert from 'assert/strict';

export default class MemberCountTask extends BushTask {
	public constructor() {
		super('memberCount', {
			delay: Time.Minute,
			runOnStart: true
		});
	}

	public override async exec() {
		if (!this.client.config.isProduction) return;

		const res = await Promise.allSettled(
			this.client.guilds.cache
				.filter((g) => g.memberCount >= 100)
				.map((g) => MemberCount.create({ guildId: g.id, memberCount: g.memberCount }))
		);

		res
			.filter((r) => r.status === 'rejected')
			.forEach((r) => {
				assert(r.status === 'rejected');
				void this.client.console.error('memberCount', r.status);
			});
	}
}
