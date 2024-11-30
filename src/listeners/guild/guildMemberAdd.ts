import { BotListener, Emitter, colors, emojis, format, type BotClientEvents } from '#lib';
import { EmbedBuilder, Events, type GuildMember, type TextChannel } from 'discord.js';

export default class GuildMemberAddListener extends BotListener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: Emitter.Client,
			event: Events.GuildMemberAdd
		});
	}

	public exec(...[member]: BotClientEvents[Events.GuildMemberAdd]) {
		void this.sendWelcomeMessage(member);
	}

	private async sendWelcomeMessage(member: GuildMember) {
		if (this.client.config.isDevelopment) return;
		const welcomeChannel = await member.guild.getSetting('welcomeChannel');
		if (!welcomeChannel) return;
		const welcome = this.client.channels.cache.get(welcomeChannel) as TextChannel | undefined;
		if (!welcome) return;
		if (member.guild.id !== welcome?.guild.id) throw new Error('Welcome channel must be in the guild.');

		if (!welcome.guild.members.me) return;

		if (!welcome.permissionsFor(welcome.guild.members.me).has('SendMessages'))
			return welcome.guild.error('Send Welcome Message', `I do not have permission to send messages in ${welcome}.`);

		const embed = new EmbedBuilder()
			.setDescription(
				`${emojis.join} ${format.input(
					member.user.tag
				)} joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`
			)
			.setColor(colors.green);

		await welcome
			.send({ embeds: [embed] })
			.then(() =>
				this.client.console.info(
					'guildMemberAdd',
					`Sent a message for ${format.inputLog(member.user.tag)} in ${format.inputLog(member.guild.name)}.`
				)
			)
			.catch(() =>
				welcome.guild.error(
					'Welcome Message',
					`Failed to send message for ${format.inputLog(member.user.tag)} in ${format.inputLog(member.guild.name)}.`
				)
			);
	}
}
