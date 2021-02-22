import { MessageEmbed, Message, TextChannel } from 'discord.js';
import { BotListener} from '../../extensions/BotListener';
import { stripIndents } from 'common-tags';
import { Command} from 'discord-akairo';

export default class CommandErrorListener extends BotListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commands',
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
		const errorUserEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('An error occurred')
			.setColor(this.client.consts.ErrorColor)
			.setTimestamp();
		await this.error(errorEmbed)
		if (command === undefined){
			errorUserEmbed.setDescription(`Oh no! An error occurred. Please give the developers code \`${errorNo}\`.`)
		}else{
			errorUserEmbed.setDescription(`Oh no! While running the command \`${command.aliases[0]}\`, an error happened. Please give the developers code \`${errorNo}\`.`)
		}
		try{
			if (!this.client.config.owners.includes(message.author.id)) {
				await message.util.send(errorUserEmbed);
			} else await message.channel.send(`\`\`\`${error.stack}\`\`\``);	
		}catch(e){
			console.error(e)
		}
		
	}
}
