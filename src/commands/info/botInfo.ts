import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { Embed, Permissions, version as discordJSVersion } from 'discord.js';
import * as os from 'os';
const { default: prettyBytes } = await import('pretty-bytes');
assert(prettyBytes);
assert(os);

export default class BotInfoCommand extends BushCommand {
	public constructor() {
		super('botInfo', {
			aliases: ['bot-info', 'stats'],
			category: 'info',
			description: 'Shows information about the bot',
			usage: ['bot-info'],
			examples: ['bot-info'],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [Permissions.FLAGS.EMBED_LINKS], true),
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
		if (repoUrl.includes('.git')) repoUrl = repoUrl.substring(0, repoUrl.length - 4);
		const embed = new Embed()
			.setTitle('Bot Info:')
			.addField({ name: '**Uptime**', value: util.humanizeDuration(client.uptime!, 2), inline: true })
			.addField({
				name: '**Memory Usage**',
				value: `System: ${prettyBytes(os.totalmem() - os.freemem(), { binary: true })}/${prettyBytes(os.totalmem(), {
					binary: true
				})}\nHeap: ${prettyBytes(process.memoryUsage().heapUsed, { binary: true })}/${prettyBytes(
					process.memoryUsage().heapTotal,
					{ binary: true }
				)}`,
				inline: true
			})
			.addField({ name: '**CPU Usage**', value: `${client.stats.cpu}%`, inline: true })
			.addField({ name: '**Platform**', value: Platform[process.platform], inline: true })
			.addField({ name: '**Commands Used**', value: `${client.stats.commandsUsed.toLocaleString()}`, inline: true })
			.addField({ name: '**Servers**', value: client.guilds.cache.size.toLocaleString(), inline: true })
			.addField({ name: '**Users**', value: client.users.cache.size.toLocaleString(), inline: true })
			.addField({ name: '**Discord.js Version**', value: discordJSVersion, inline: true })
			.addField({ name: '**Node.js Version**', value: process.version.slice(1), inline: true })
			.addField({ name: '**Commands**', value: client.commandHandler.modules.size.toLocaleString(), inline: true })
			.addField({ name: '**Listeners**', value: client.listenerHandler.modules.size.toLocaleString(), inline: true })
			.addField({ name: '**Inhibitors**', value: client.inhibitorHandler.modules.size.toLocaleString(), inline: true })
			.addField({ name: '**Tasks**', value: client.taskHandler.modules.size.toLocaleString(), inline: true })
			.addField({
				name: '**Current Commit**',
				value: `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`,
				inline: true
			})
			.addField({ name: '**Developers**', value: developers, inline: true })
			.setTimestamp()
			.setColor(util.colors.default);
		await message.util.reply({ embeds: [embed] });
	}
}
