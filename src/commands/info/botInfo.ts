import { MessageEmbed, Message, CommandInteraction } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { duration } from 'moment';

export default class BotInfoCommand extends BushCommand {
	constructor() {
		super('botinfo', {
			aliases: ['botinfo'],
			category: 'info',
			description: {
				content: 'Shows information about the bot',
				usage: 'botinfo',
				examples: ['botinfo']
			}
		});
	}

	private async generateEmbed(): Promise<MessageEmbed> {
		const owners = (await this.client.util.mapIDs(this.client.ownerID))
			.map((u) => u.tag)
			.join('\n');
		const currentCommit = (await this.client.util.shell('git rev-parse HEAD')).stdout.replace(
			'\n',
			''
		);
		const repoUrl = (await this.client.util.shell('git remote get-url origin')).stdout.replace(
			'\n',
			''
		);
		const embed = new MessageEmbed()
			.setTitle('Bot Info:')
			.addFields([
				{
					name: 'Owners',
					value: owners,
					inline: true
				},
				{
					name: 'Uptime',
					value: this.client.util.capitalize(
						duration(this.client.uptime, 'milliseconds').humanize()
					)
				},
				{
					name: 'User count',
					value: this.client.users.cache.size,
					inline: true
				},
				{
					name: 'Current commit',
					value: `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`
				}
			])
			.setTimestamp();
		return embed;
	}

	public async exec(message: Message): Promise<void> {
		await message.util.send(await this.generateEmbed());
	}

	public async execSlash(message: CommandInteraction): Promise<void> {
		await message.reply(await this.generateEmbed());
	}
}
