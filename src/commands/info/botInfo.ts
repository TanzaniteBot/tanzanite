import {
	AllIntegrationTypes,
	AllInteractionContexts,
	BotCommand,
	colors,
	humanizeDuration,
	shell,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { AkairoHandler, version as akairoVersion } from '@tanzanite/discord-akairo';
import { EmbedBuilder, version as discordJSVersion } from 'discord.js';
import assert from 'node:assert/strict';
import * as os from 'node:os';
const { default: prettyBytes } = await import('pretty-bytes');
assert(prettyBytes);
assert(os);

export default class BotInfoCommand extends BotCommand {
	public constructor() {
		super('botInfo', {
			aliases: ['bot-info', 'stats'],
			category: 'info',
			description: 'Shows information about the bot',
			usage: ['bot-info'],
			examples: ['bot-info'],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	#memory() {
		const usedSystem = prettyBytes(os.totalmem() - os.freemem(), { binary: true });
		const totalSystem = prettyBytes(os.totalmem(), { binary: true });
		const usedHeap = prettyBytes(process.memoryUsage().heapUsed, { binary: true });
		const totalHeap = prettyBytes(process.memoryUsage().heapTotal, { binary: true });

		return `System: ${usedSystem}/${totalSystem}\nHeap: ${usedHeap}/${totalHeap}`;
	}

	public override async exec(message: CommandMessage | SlashMessage) {
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

		const {
			client,
			client: { utils, config, stats }
		} = this;

		const developers = (await utils.mapIDs(config.owners)).map((u) => u?.tag).join('\n');
		const currentCommit = (await shell('git rev-parse HEAD')).stdout.replace('\n', '');
		let repoUrl = (await shell('git remote get-url origin')).stdout.replace('\n', '');
		if (repoUrl.includes('.git')) repoUrl = repoUrl.substring(0, repoUrl.length - 4);

		const countModules = (handler: AkairoHandler<any, any, any>) => handler.modules.size.toLocaleString();

		const embed = new EmbedBuilder()
			.setTitle('Bot Info:')
			.addFields(
				{ name: '**Uptime**', value: humanizeDuration(client.uptime!, 2), inline: true },
				{ name: '**Memory Usage**', value: this.#memory(), inline: true },
				{ name: '**CPU Usage**', value: `${stats.cpu}%`, inline: true },
				{ name: '**Platform**', value: Platform[process.platform], inline: true },
				{ name: '**Commands Used**', value: `${stats.commandsUsed.toLocaleString()}`, inline: true },
				{ name: '**Slash Commands Used**', value: `${stats.slashCommandsUsed.toLocaleString()}`, inline: true },
				{ name: '**Servers**', value: client.guilds.cache.size.toLocaleString(), inline: true },
				{ name: '**Users**', value: client.users.cache.size.toLocaleString(), inline: true },
				{ name: '**Commands**', value: countModules(client.commandHandler), inline: true },
				{ name: '**Listeners**', value: countModules(client.listenerHandler), inline: true },
				{ name: '**Inhibitors**', value: countModules(client.inhibitorHandler), inline: true },
				{ name: '**Tasks**', value: countModules(client.taskHandler), inline: true },
				{ name: '**@tanzanite/discord.js Version**', value: discordJSVersion, inline: false },
				{ name: '**@tanzanite/discord-akairo Version**', value: akairoVersion, inline: false },
				{ name: '**Node.js Version**', value: process.version.slice(1), inline: true },
				{
					name: '**Current Commit**',
					value: `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`,
					inline: true
				},
				{ name: '**Developers**', value: developers, inline: true }
			)
			.setTimestamp()
			.setColor(colors.default);
		await message.util.reply({ embeds: [embed] });
	}
}
