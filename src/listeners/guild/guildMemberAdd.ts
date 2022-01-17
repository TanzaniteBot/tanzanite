import { BushListener, type BushClientEvents, type BushGuildMember, type BushTextChannel } from '#lib';
import { MessageEmbed } from 'discord.js';

export default class GuildMemberAddListener extends BushListener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'guild'
		});
	}

	public override async exec(...[member]: BushClientEvents['guildMemberAdd']) {
		void this.sendWelcomeMessage(member);
	}

	private async sendWelcomeMessage(member: BushGuildMember) {
		if (client.config.isDevelopment) return;
		const welcomeChannel = await member.guild.getSetting('welcomeChannel');
		if (!welcomeChannel) return;
		const welcome = client.channels.cache.get(welcomeChannel) as BushTextChannel | undefined;
		if (!welcome) return;
		if (member.guild.id !== welcome?.guild.id) throw new Error('Welcome channel must be in the guild.');
		const embed = new MessageEmbed()
			.setDescription(
				`${util.emojis.join} ${util.format.input(
					member.user.tag
				)} joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`
			)
			.setColor(util.colors.green);
		await welcome
			.send({ embeds: [embed] })
			.then(() =>
				client.console.info(
					'guildMemberAdd',
					`Sent a message for ${util.format.inputLog(member.user.tag)} in ${util.format.inputLog(member.guild.name)}.`
				)
			)
			.catch(() =>
				client.console.warn(
					'guildMemberAdd',
					`Failed to send message for ${util.format.inputLog(member.user.tag)} in ${util.format.inputLog(member.guild.name)}.`
				)
			);
	}
}
