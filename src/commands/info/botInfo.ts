import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed, version as discordJSVersion } from 'discord.js';
import * as os from 'os';
import prettyBytes from 'pretty-bytes';

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

	public override async exec(message: BushMessage | BushSlashMessage): Promise<void> {
		enum Platform {
			aix = 'AIX',
			android = 'Android',
			darwin = 'MacOS',
			freebsd = 'FreeBSD',
			linux = 'Linux',
			openbsd = 'OpenBSD',
			sunos = 'SunOS',
			win32 = 'Windows',
			cygwin = 'Cygwin',
			netbsd = 'NetBSD'
		}

		const developers = (await util.mapIDs(client.config.owners)).map((u) => u?.tag).join('\n');
		const currentCommit = (await util.shell('git rev-parse HEAD')).stdout.replace('\n', '');
		let repoUrl = (await util.shell('git remote get-url origin')).stdout.replace('\n', '');
		repoUrl = repoUrl.substring(0, repoUrl.length - 4);
		const embed = new MessageEmbed()
			.setTitle('Bot Info:')
			.addField('**Uptime**', util.humanizeDuration(client.uptime!), true)
			.addField(
				'**Memory Usage**',
				`System: ${prettyBytes(os.totalmem() - os.freemem(), { binary: true })}/${prettyBytes(os.totalmem(), {
					binary: true
				})}\nHeap: ${prettyBytes(process.memoryUsage().heapUsed, { binary: true })}/${prettyBytes(
					process.memoryUsage().heapTotal,
					{ binary: true }
				)}`,
				true
			)
			.addField('**CPU Usage**', `${client.stats.cpu}%`, true)
			.addField('**Platform**', Platform[process.platform], true)
			.addField('**Commands Used**', `${client.stats.commandsUsed}`, true)
			.addField('**Servers**', client.guilds.cache.size.toLocaleString(), true)
			.addField('**Users**', client.users.cache.size.toLocaleString(), true)
			.addField('**Discord.js Version**', discordJSVersion, true)
			.addField('**Node.js Version**', process.version.slice(1), true)
			.addField('**Commands**', client.commandHandler.modules.size.toLocaleString(), true)
			.addField('**Listeners**', client.listenerHandler.modules.size.toLocaleString(), true)
			.addField('**Inhibitors**', client.inhibitorHandler.modules.size.toLocaleString(), true)
			.addField('**Tasks**', client.taskHandler.modules.size.toLocaleString(), true)
			.addField('**Current Commit**', `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`, true)
			.addField('**Developers**', developers, true)
			.setTimestamp()
			.setColor(util.colors.default);
		await message.util.reply({ embeds: [embed] });
	}
}
