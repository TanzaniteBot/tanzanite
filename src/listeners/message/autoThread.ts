import { BushListener, type BushClientEvents, type BushTextChannel } from '#lib';
import { type GuildTextBasedChannels } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';

export default class autoThreadListener extends BushListener {
	public constructor() {
		super('autoThread', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']): Promise<Promise<void> | undefined> {
		if (!client.config.isProduction) return;
		if (!message.guild || !message.channel) return;
		if (!['DEFAULT', 'REPLY'].includes(message.type)) return;
		if (
			message.author.bot &&
			message.author.id === '444871677176709141' && //fire
			message.content.includes('has been banished from') &&
			message.content.includes('<:yes:822211477624586260>')
		)
			return;

		if (
			(message.content.trim().startsWith(await message.guild.getSetting('prefix')) ||
				message.content.trim().startsWith(`<@!${client.user!.id}>`) ||
				message.content.trim().startsWith(`<@${client.user!.id}>`)) &&
			client.commandHandler.aliases.some((alias) => message.content.includes(alias))
		)
			return;

		if (message.thread) return;

		// todo: make these configurable etc...
		if (message.guild.id !== '516977525906341928') return; // mb
		if (message.channel.id !== '714332750156660756') return; // neu-support-1
		if (!(message.channel as BushTextChannel).permissionsFor(message.guild.me!).has('CREATE_PUBLIC_THREADS')) return;
		const thread = await message.startThread({
			name: `Support - ${message.author.username}＃${message.author.discriminator}`,
			autoArchiveDuration: 60,
			reason: 'Support Thread'
		}).catch(() => null);
		if (!thread) return;
		const embed = new MessageEmbed()
			.setTitle('NotEnoughUpdates Support')
			.setDescription(
				`Welcome to Moulberry Bush Support:tm:\n\nPlease make sure you have the latest version found in <#693586404256645231>.\nAdditionally if you need help installing the mod be sure to read <#737444942724726915> for a guide on how to do so.`
			)
			.setColor('BLURPLE');
		void thread
			.send({ embeds: [embed] })
			.then(() =>
				client.console.info(
					'supportThread',
					`opened a support thread for <<${message.author.tag}>> in <<${
						(message.channel as GuildTextBasedChannels).name
					}>> in <<${message.guild!.name}>>.`
				)
			);
	}
}
