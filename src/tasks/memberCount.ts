import { BushTask, MemberCount, Time } from '#lib';
import assert from 'assert';

export default class MemberCountTask extends BushTask {
	public constructor() {
		super('memberCount', {
			delay: Time.Minute,
			runOnStart: true
		});
	}

	public override async exec() {
		if (!client.config.isProduction) return;

		const res = await Promise.allSettled(
			client.guilds.cache.map((g) => MemberCount.create({ guildId: g.id, memberCount: g.memberCount }))
		);

		res
			.filter((r) => r.status === 'rejected')
			.forEach((r) => {
				assert(r.status === 'rejected');
				void client.console.error('memberCount', r.status);
			});
	}
}
