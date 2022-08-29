import { BotClientEvents, BotListener, MemberAutomod } from '#lib';
import chalk from 'chalk';

export default class PresenceAutomodListener extends BotListener {
	public constructor() {
		super('memberAutomod', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		});
	}

	public async exec(...[_, newMember]: BotClientEvents['guildMemberUpdate']) {
		if (!(await newMember.guild.hasFeature('automodMembers'))) return;
		if (!(await newMember.guild.hasFeature('automod'))) return;

		new MemberAutomod(newMember);
		console.log(
			`${chalk.hex('#ff7105')('[MemberAutomod]')} Created a new MemberAutomod for ${newMember.user.tag} (${newMember.user.id})`
		);
	}
}
