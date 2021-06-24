import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushSlashMessage } from '../../lib/extensions/BushInteractionMessage';
import { BushListener } from '../../lib/extensions/BushListener';

export default class SlashCommandErrorListener extends BushListener {
	constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError'
		});
	}
	async exec(error: Error, message: BushSlashMessage, command: BushCommand): Promise<void> {
		const errorNo = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(`Slash Error # \`${errorNo}\`: An error occurred`)
			.setDescription(
				stripIndents`**User:** ${message.author} (${message.author.tag})
			**Slash Command:** ${command}
			**Channel:** ${message.channel || message.interaction.user?.tag} ${message.channel ? `(${message.channel?.id})` : ''}
			**Message:** [link](https://discord.com/${message.guild?.id}/${message.channel?.id}/${message.id})`
			)
			.addField('Error', await this.client.util.codeblock(`${error?.stack}`, 1024, 'js'))
			.setColor(this.client.util.colors.error)
			.setTimestamp();

		await this.client.logger.channelError({ embeds: [errorEmbed] });
		if (message) {
			const channel = message.channel?.name || message.interaction.user.tag;
			if (!this.client.config.owners.includes(message.author.id)) {
				const errorUserEmbed: MessageEmbed = new MessageEmbed()
					.setTitle('A Slash Command Error Occurred')
					.setColor(this.client.util.colors.error)
					.setTimestamp();
				if (!command)
					errorUserEmbed.setDescription(`Oh no! An error occurred. Please give the developers code \`${errorNo}\`.`);
				else
					errorUserEmbed.setDescription(
						`Oh no! While running the command \`${command.id}\`, an error occurred. Please give the developers code \`${errorNo}\`.`
					);
				await message.util.send({ embeds: [errorUserEmbed] }).catch((e) => {
					this.client.console.warn('SlashError', `Failed to send user error embed in <<${channel}>>:\n` + e?.stack);
				});
			} else {
				const errorDevEmbed = new MessageEmbed()
					.setTitle('A Slash Command Error Occurred')
					.setColor(this.client.util.colors.error)
					.setTimestamp()
					.setDescription(await this.client.util.codeblock(`${error?.stack}`, 2048, 'js'));
				await message.util.send({ embeds: [errorDevEmbed] }).catch((e) => {
					this.client.console.warn('SlashError', `Failed to send owner error stack in <<${channel}>>.` + e?.stack);
				});
			}
		}
		const channel = message.channel?.name || message.interaction.user.tag;
		this.client.console.error(
			'SlashError',
			`an error occurred with the <<${command}>> command in <<${channel}>> triggered by <<${message?.author?.tag}>>:\n` +
				error?.stack,
			false
		);
	}
}
