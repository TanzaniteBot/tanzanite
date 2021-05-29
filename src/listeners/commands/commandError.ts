import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushListener } from '../../lib/extensions/BushListener';
import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { TextChannel } from 'discord.js';

export default class CommandErrorListener extends BushListener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error'
		});
	}
	async exec(error: Error, message: Message, command?: BushCommand): Promise<void> {
		const errorNumber = Math.floor(Math.random() * 6969696969) + 69; // hehe funy numbers
		const errorDevEmbed = this.client.util
			.createEmbed(this.client.util.colors.error)
			.setTitle(`Error # \`${errorNumber}\`: An error occurred`)
			.setDescription(
				stripIndents`**User:** ${message.author} (${message.author.tag})
				**Command:** ${command}
				**Channel:** ${message.channel} (${message.channel.id})
				**Message:** [link](${message.url})`
			)
			.addField('Error', `${await this.client.util.haste(error.stack)}`);
		let errorUserEmbed: MessageEmbed;
		if (command) {
			errorUserEmbed = this.client.util
				.createEmbed(this.client.util.colors.error)
				.setTitle('An error occurred')
				.setDescription(
					stripIndents`Whoops! It appears like something broke.
				The developers have been notified of this. If you contact them, give them code \`${errorNumber}\`.
				`
				);
		}
		const channel = (await this.client.channels.fetch(this.client.config.channels.log)) as TextChannel;
		await channel.send(errorDevEmbed);
		if (errorUserEmbed) await message.reply(errorUserEmbed);
	}
}
