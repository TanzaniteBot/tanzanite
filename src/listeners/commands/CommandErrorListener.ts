import { MessageEmbed, Message } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';
import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import functions from '../../constants/functions';
import chalk from 'chalk';

export default class CommandErrorListener extends BotListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commands'
		});
	}

	public async exec(error: Error, message: Message, command: Command | null | undefined): Promise<void> {
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
		const errorUserEmbed: MessageEmbed = new MessageEmbed().setTitle('An error occurred').setColor(this.client.consts.ErrorColor).setTimestamp();
		await this.error(errorEmbed);
		if (!command) {
			errorUserEmbed.setDescription(`Oh no! An error occurred. Please give the developers code \`${errorNo}\`.`);
		} else {
			errorUserEmbed.setDescription(`Oh no! While running the command \`${command.aliases[0]}\`, an error occurred. Please give the developers code \`${errorNo}\`.`);
		}
		if (message) {
			if (!this.client.config.owners.includes(message.author.id)) {
				await message.util.send(errorUserEmbed).catch(() => {
					console.warn(`${chalk.bgYellow(functions.timeStamp())} ${chalk.yellow('[CommandError]')} Failed to send user error embed.`);
				});
			} else {
				await message.channel.send(`\`\`\`${error.stack}\`\`\``).catch(() => {
					console.warn(`${chalk.bgYellow(functions.timeStamp())} ${chalk.yellow('[CommandError]')} Failed to send owner error stack.`);
				});
			}
		}
		console.error(`${chalk.bgRedBright(functions.timeStamp())} ${chalk.redBright('[CommandError]')} an error occurred with the ${chalk.blueBright(command)} command in #${chalk.blueBright(message?.channel)} triggered by ${chalk.blueBright(message?.author?.tag)}.`);
	}
}
