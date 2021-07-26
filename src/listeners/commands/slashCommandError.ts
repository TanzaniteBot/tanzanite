import { BushCommandHandlerEvents, BushListener } from '@lib';
import { stripIndents } from 'common-tags';
import { GuildChannel, MessageEmbed } from 'discord.js';

export default class SlashCommandErrorListener extends BushListener {
	public constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError',
			category: 'commands'
		});
	}
	async exec(...[error, message, command]: BushCommandHandlerEvents['slashError']): Promise<void> {
		const errorNo = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(`Slash Error # \`${errorNo}\`: An error occurred`)
			.setDescription(
				stripIndents`**User:** ${message.author} (${message.author.tag})
			**Slash Command:** ${command}
			**Channel:** ${message.channel || message.interaction.user?.tag} ${message.channel ? `(${message.channel?.id})` : ''}
			**Message:** [link](https://discord.com/${message.guild?.id}/${message.channel?.id}/${message.id})`
			)
			.addField('Error', await util.codeblock(`${error?.stack || error}`, 1024, 'js'))
			.setColor(util.colors.error)
			.setTimestamp();

		await client.logger.channelError({ embeds: [errorEmbed] });
		if (message) {
			const channel = (message.channel as GuildChannel)?.name || message.interaction.user.tag;
			if (!client.config.owners.includes(message.author.id)) {
				const errorUserEmbed: MessageEmbed = new MessageEmbed()
					.setTitle('A Slash Command Error Occurred')
					.setColor(util.colors.error)
					.setTimestamp();
				if (!command)
					errorUserEmbed.setDescription(`Oh no! An error occurred. Please give the developers code \`${errorNo}\`.`);
				else
					errorUserEmbed.setDescription(
						`Oh no! While running the command \`${command.id}\`, an error occurred. Please give the developers code \`${errorNo}\`.`
					);
				(await message.util?.send({ embeds: [errorUserEmbed] }).catch((e) => {
					client.console.warn('SlashError', `Failed to send user error embed in <<${channel}>>:\n` + e?.stack || e);
				})) ?? client.console.error('SlashError', `Failed to send user error embed.` + error?.stack || error, false);
			} else {
				const errorDevEmbed = new MessageEmbed()
					.setTitle('A Slash Command Error Occurred')
					.setColor(util.colors.error)
					.setTimestamp()
					.setDescription(await util.codeblock(`${error?.stack || error}`, 2048, 'js'));
				(await message.util?.send({ embeds: [errorDevEmbed] }).catch((e) => {
					client.console.warn('SlashError', `Failed to send owner error stack in <<${channel}>>.` + e?.stack || e);
				})) ?? client.console.error('SlashError', `Failed to send user error embed.` + error?.stack || error, false);
			}
		}
		const channel = (message.channel as GuildChannel)?.name || message.interaction.user.tag;
		client.console.error(
			'SlashError',
			`an error occurred with the <<${command}>> command in <<${channel}>> triggered by <<${message?.author?.tag}>>:\n` +
				error?.stack || error,
			false
		);
	}
}
