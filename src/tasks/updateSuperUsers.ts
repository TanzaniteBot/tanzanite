import { BushTask } from '../lib/extensions/discord-akairo/BushTask';
import { Global } from '../lib/models/Global';

export default class UpdateSuperUsersTask extends BushTask {
	public constructor() {
		super('updateSuperUsers', {
			delay: 10_000,
			runOnStart: true
		});
	}
	public override async exec() {
		const superUsers = client.guilds.cache
			.get(client.config.supportGuild.id)
			?.members.cache.filter(
				(member) =>
					(member.roles.cache.has('865954009280938056') || member.permissions.has('ADMINISTRATOR')) && !member.user.bot
			)
			.map((member) => member.id);

		const row =
			(await Global.findByPk(client.config.environment)) ?? (await Global.create({ environment: client.config.environment }));

		row.superUsers = superUsers ?? row.superUsers;
		client.cache.global.superUsers = superUsers ?? row.superUsers;
		await row.save();

		void client.logger.verbose(`updateSuperUsers`, 'Updated superusers.');
	}
}
