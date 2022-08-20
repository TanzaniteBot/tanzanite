import { BushClientEvents, BushListener, MemberAutomod } from '#lib';
import chalk from 'chalk';

export default class PresenceAutomodListener extends BushListener {
	public constructor() {
		super('memberAutomod', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		});
	}

	public async exec(...[_, newMember]: BushClientEvents['guildMemberUpdate']) {
		if (!(await newMember.guild.hasFeature('automodMembers'))) return;
		if (!(await newMember.guild.hasFeature('automod'))) return;

		new MemberAutomod(newMember);
		console.log(
			`${chalk.hex('#ff7105')('[MemberAutomod]')} Created a new MemberAutomod for ${newMember.user.tag} (${newMember.user.id})`
		);
	}
}
