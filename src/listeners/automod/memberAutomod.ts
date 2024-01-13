import { BotListener, Emitter, MemberAutomod, type BotClientEvents } from '#lib';
import chalk from 'chalk';
import { Events } from 'discord.js';

export default class MemberAutomodListener extends BotListener {
	public constructor() {
		super('memberAutomod', {
			emitter: Emitter.Client,
			event: Events.GuildMemberUpdate
		});
	}

	public async exec(...[_, newMember]: BotClientEvents[Events.GuildMemberUpdate]) {
		if (!(await newMember.guild.hasFeatures('automodMembers', 'automod'))) return;

		new MemberAutomod(newMember);
		console.log(
			`${chalk.hex('#ff7105')('[MemberAutomod]')} Created a new MemberAutomod for ${newMember.user.tag} (${newMember.user.id})`
		);
	}
}
