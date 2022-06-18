import { BushListener, colors, type BushClientEvents } from '#lib';
import { stripIndent } from '#tags';
import assert from 'assert';
import { EmbedBuilder, MessageType, PermissionFlagsBits, TextChannel } from 'discord.js';

export default class SupportThreadListener extends BushListener {
	public constructor() {
		super('supportThread', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'bush'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']): Promise<void | undefined> {
		if (!this.client.config.isProduction || !message.inGuild()) return;
		if (![MessageType.Default, MessageType.Reply].includes(message.type)) return;
		if (message.thread) return;
		if (message.author.bot && (message.author.id !== '444871677176709141' || !message.content.includes('uploaded a log,')))
			return;

		if (message.guild.id !== '516977525906341928') return; // mb
		if (message.channel.id !== '714332750156660756') return; // neu-support

		if (
			[await message.guild.getSetting('prefix'), `<@!${this.client.user!.id}>`, `<@${this.client.user!.id}>`].some((v) =>
				message.content.trim().startsWith(v)
			) &&
			this.client.commandHandler.aliases.some((alias) => message.content.includes(alias))
		)
			return;

		assert(message.channel instanceof TextChannel);

		if (!message.channel.permissionsFor(message.guild.members.me!).has(PermissionFlagsBits.CreatePublicThreads)) return;
		const thread = await message
			.startThread({
				name: `Support - ${message.author.username}＃${message.author.discriminator}`,
				autoArchiveDuration: 60,
				reason: 'Support Thread'
			})
			.catch(() => null);
		if (!thread) return;
		const embed = new EmbedBuilder()
			.setTitle('NotEnoughUpdates Support')
			.setDescription(
				stripIndent`
				Welcome to Moulberry Bush Support:tm:

				Please make sure you have the latest version found in <#693586404256645231>.
				Additionally if you need help installing the mod be sure to read <#737444942724726915> for a guide on how to do so.`
			)
			.setColor(colors.Blurple);
		void thread
			.send({ embeds: [embed] })
			.then(() =>
				this.client.console.info(
					'supportThread',
					`opened a support thread for <<${message.author.tag}>> in <<${message.channel.name}>> in <<${message.guild!.name}>>.`
				)
			);
	}
}
