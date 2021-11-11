import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { MessageEmbed, version as discordJSVersion } from 'discord.js';
import * as os from 'os';
const {default: prettyBytes} = await import('pretty-bytes')

export default class BotInfoCommand extends BushCommand {
	public constructor() {
		super('botInfo', {
			aliases: ['bot-info', 'stats'],
			category: 'info',
			description: {
				content: 'Shows information about the bot',
				usage: ['bot-info'],
				examples: ['bot-info']
			},
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
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
			netbsd = 'NetBSD',
			haiku = 'Haiku'
		}

		const developers = (await util.mapIDs(client.config.owners)).map((u) => u?.tag).join('\n');
		const currentCommit = (await util.shell('git rev-parse HEAD')).stdout.replace('\n', '');
		let repoUrl = (await util.shell('git remote get-url origin')).stdout.replace('\n', '');
		repoUrl = repoUrl.substring(0, repoUrl.length - 4);
		const embed = new MessageEmbed()
			.setTitle('Bot Info:')
			.addField('**Uptime**', util.humanizeDuration(client.uptime!, 2), true)
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
			.addField('**Commands Used**', `${client.stats.commandsUsed.toLocaleString()}`, true)
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
