import { Message, MessageEmbed } from 'discord.js';
import { BushCommand } from '../../lib';

export default class BotInfoCommand extends BushCommand {
	public constructor() {
		super('botinfo', {
			aliases: ['botinfo'],
			category: 'info',
			description: {
				content: 'Shows information about the bot',
				usage: 'botinfo',
				examples: ['botinfo']
			},
			slash: true,
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public async exec(message: Message): Promise<void> {
		const owners = (await this.client.util.mapIDs(this.client.ownerID)).map((u) => u.tag).join('\n');
		const currentCommit = (await this.client.util.shell('git rev-parse HEAD')).stdout.replace('\n', '');
		const repoUrl = (await this.client.util.shell('git remote get-url origin')).stdout.replace('\n', '');
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
					value: this.client.util.capitalize(this.client.util.humanizeDuration(this.client.uptime))
				},
				{
					name: 'User count',
					value: this.client.users.cache.size.toLocaleString(),
					inline: true
				},
				{
					name: 'Current commit',
					value: `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`
				}
			])
			.setTimestamp();
		await message.util.reply({ embeds: [embed] });
	}
}
