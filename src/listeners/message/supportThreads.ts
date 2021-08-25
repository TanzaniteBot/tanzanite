import { GuildTextBasedChannels } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { BushListener, BushTextChannel } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class MessageVerboseListener extends BushListener {
	public constructor() {
		super('supportThreads', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']): Promise<Promise<void> | undefined> {
		if (!message.guild || !message.channel) return;
		// todo: make these configurable etc...
		if (message.guild.id !== '516977525906341928') return; // mb
		if (message.channel.id !== '714332750156660756') return; // neu-support-1
		if (!(message.channel as BushTextChannel).permissionsFor(message.guild.me!).has('USE_PUBLIC_THREADS')) return;
		const thread = await message.startThread({
			name: `Support - ${message.author.username}＃${message.author.discriminator}`,
			autoArchiveDuration: 1440,
			reason: 'Support Thread'
		});
		const embed = new MessageEmbed()
			.setTitle('NotEnoughUpdates Support')
			.setDescription(
				`Welcome to Moulberry Bush Support:tm:\n\nPlease make sure you have the latest prerelease found in <#693586404256645231>.\nAdditionally if you need help installing the mod be sure to read <#737444942724726915> for a guide on how to do so.`
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
