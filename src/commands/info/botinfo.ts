import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { duration } from 'moment';
import { BotMessage } from '../../lib/extensions/BotMessage';

export default class BotInfoCommand extends BotCommand {
	constructor() {
		super('botinfo', {
			aliases: ['botinfo'],
			description: {
				content: 'Shows information about the bot',
				usage: 'botinfo',
				examples: ['botinfo']
			}
		});
	}

	public async exec(message: BotMessage): Promise<void> {
		const owners = (await this.client.util.mapIDs(this.client.ownerID))
			.map((u) => u.tag)
			.join('\n');
		const currentCommit = (
			await this.client.util.shell('git rev-parse HEAD')
		).stdout.replace('\n', '');
		const repoUrl = (
			await this.client.util.shell('git remote get-url origin')
		).stdout.replace('\n', '');
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
					value: `[${currentCommit.substring(
						0,
						7
					)}](${repoUrl}/commit/${currentCommit})`
				}
			])
			.setTimestamp();
		await message.util.send(embed);
	}
}
