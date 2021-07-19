import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed, version as discordJSVersion } from 'discord.js';

export default class BotInfoCommand extends BushCommand {
	public constructor() {
		super('botinfo', {
			aliases: ['botinfo', 'stats'],
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

	public async exec(message: BushMessage | BushSlashMessage): Promise<void> {
		const developers = (await this.client.util.mapIDs(this.client.config.owners)).map((u) => u?.tag).join('\n');
		const currentCommit = (await this.client.util.shell('git rev-parse HEAD')).stdout.replace('\n', '');
		let repoUrl = (await this.client.util.shell('git remote get-url origin')).stdout.replace('\n', '');
		repoUrl = repoUrl.substring(0, repoUrl.length-4)
		const embed = new MessageEmbed()
			.setTitle('Bot Info:')
			.addField('**Uptime**', this.client.util.humanizeDuration(this.client.uptime), true)
			.addField('**Servers**', this.client.guilds.cache.size.toLocaleString(), true)
			.addField('**Users**', this.client.users.cache.size.toLocaleString(), true)
			.addField('**Discord.js Version**', discordJSVersion, true)
			.addField('**Node.js Version**', process.version.slice(1), true)
			.addField('**Commands**', this.client.commandHandler.modules.size.toLocaleString(), true)
			.addField('**Listeners**', this.client.listenerHandler.modules.size.toLocaleString(), true)
			.addField('**Inhibitors**', this.client.inhibitorHandler.modules.size.toLocaleString(), true)
			.addField('**Tasks**', this.client.taskHandler.modules.size.toLocaleString(), true)
			.addField('**Current Commit**', `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`, true)
			.addField('**Developers**', developers, true)
			.setTimestamp()
			.setColor(this.client.util.colors.default);
		await message.util.reply({ embeds: [embed] });
	}
}
