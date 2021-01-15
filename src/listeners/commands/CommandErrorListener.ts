import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import { stripIndents } from 'common-tags';
import { TextChannel } from 'discord.js';
import { BotListener } from '../../../libs/extensions/BotListener';

export default class CommandErrorListener extends BotListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commands',
		});
	}

	public async exec(error: Error, message: Message, command: Command | null | undefined): Promise<void> {
		const errorChannel = <TextChannel>this.client.channels.cache.get(this.client.config.errorChannel);
		const errorNo = Math.floor(Math.random() * 6969696969) + 69; // hehe funy number
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(`Error # \`${errorNo}\`: An error occurred`)
			.setDescription(
				stripIndents`**User:** ${message.author} (${message.author.tag})
				**Command:** ${command}
				**Channel:** ${message.channel} (${message.channel.id})
				**Message:** [link](${message.url})`
			)
			.addField('Error', `${await this.client.consts.haste(error.stack)}`)
			.setColor(this.client.consts.ErrorColor)
			.setTimestamp();
		const errorUserEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('An error occurred')
			.setDescription(
				`Oh no! While running the command \`${command.aliases[0]}\`, an error happened. Please give the developers code \`${errorNo}\`.`
			)
			.setColor(this.client.consts.ErrorColor)
			.setTimestamp();
		errorChannel.send(errorEmbed);
		if (!this.client.config.owners.includes(message.author.id)) {
			message.util.send(errorUserEmbed);
		} else message.channel.send(error.stack);
	}
}
