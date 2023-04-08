import { BotListener, Emitter, MemberAutomod, type BotClientEvents } from '#lib';
import chalk from 'chalk';
import { Events } from 'discord.js';

export default class PresenceAutomodListener extends BotListener {
	public constructor() {
		super('memberAutomod', {
			emitter: Emitter.Client,
			event: Events.GuildMemberUpdate
		});
	}

	public async exec(...[_, newMember]: BotClientEvents[Events.GuildMemberUpdate]) {
		if (!(await newMember.guild.hasFeature('automodMembers'))) return;
		if (!(await newMember.guild.hasFeature('automod'))) return;

		new MemberAutomod(newMember);
		console.log(
			`${chalk.hex('#ff7105')('[MemberAutomod]')} Created a new MemberAutomod for ${newMember.user.tag} (${newMember.user.id})`
		);
	}
}
