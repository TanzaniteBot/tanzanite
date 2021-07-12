import { BushListener, BushMessage } from '@lib';
import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';

export default class CommandErrorListener extends BushListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error'
		});
	}

	public async exec(error: Error, message: BushMessage, command: Command | null | undefined): Promise<void> {
		const errorNo = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(`Error # \`${errorNo}\`: An error occurred`)
			.setDescription(
				stripIndents`**User:** ${message.author} (${message.author.tag})
				**Command:** ${command}
				**Channel:** ${message.channel} (${message.channel?.id})
				**Message:** [link](${message.url})`
			)
			.addField('Error', await this.client.util.codeblock(`${error?.stack || error}`, 1024, 'js'))
			.setColor(this.client.util.colors.error)
			.setTimestamp();

		await this.client.logger.channelError({ embeds: [errorEmbed] });
		if (message) {
			if (!this.client.config.owners.includes(message.author.id)) {
				const errorUserEmbed: MessageEmbed = new MessageEmbed()
					.setTitle('A Command Error Occurred')
					.setColor(this.client.util.colors.error)
					.setTimestamp();
				if (!command)
					errorUserEmbed.setDescription(`Oh no! An error occurred. Please give the developers code \`${errorNo}\`.`);
				else
					errorUserEmbed.setDescription(
						`Oh no! While running the command \`${command.id}\`, an error occurred. Please give the developers code \`${errorNo}\`.`
					);
				await message.util.send({ embeds: [errorUserEmbed] }).catch((e) => {
					const channel = message.channel.type === 'DM' ? message.channel.recipient.tag : message.channel.name;
					this.client.console.warn('CommandError', `Failed to send user error embed in <<${channel}>>:\n` + e?.stack || e);
				});
			} else {
				const errorDevEmbed = new MessageEmbed()
					.setTitle('A Command Error Occurred')
					.setColor(this.client.util.colors.error)
					.setTimestamp()
					.setDescription(await this.client.util.codeblock(`${error?.stack || error}`, 2048, 'js'));
				await message.util.send({ embeds: [errorDevEmbed] }).catch((e) => {
					const channel = message.channel.type === 'DM' ? message.channel.recipient.tag : message.channel.name;
					this.client.console.warn('CommandError', `Failed to send owner error stack in <<${channel}>>.` + e?.stack || e);
				});
			}
		}
		const channel = message.channel.type === 'DM' ? message.channel.recipient.tag : message.channel.name;
		this.client.console.error(
			'CommandError',
			`an error occurred with the <<${command}>> command in <<${channel}>> triggered by <<${message?.author?.tag}>>:\n` +
				error?.stack || error,
			false
		);
	}
}
