import type { Config } from '#config';
import { init, onUnhandledRejectionIntegration, rewriteFramesIntegration } from '@sentry/node';
import { AkairoMessage, type MessageUnion } from '@tanzanite/discord-akairo';
import type { Guild, TextBasedChannel } from 'discord.js';

export class Sentry {
	public constructor(rootdir: string, config: Config) {
		if (config.credentials.sentryDsn == null) throw TypeError('sentryDsn cannot be null');

		init({
			dsn: config.credentials.sentryDsn,
			environment: config.environment,
			tracesSampleRate: 1.0,
			integrations: [
				rewriteFramesIntegration({
					root: rootdir
				}),
				onUnhandledRejectionIntegration({
					mode: 'none'
				})
			]
		});
	}
}

const shrug = '¯\\_(ツ)_/¯';

function channelName(channel: TextBasedChannel | null) {
	if (!channel) return shrug;

	if (channel.isDMBased()) {
		if (channel.isSendable()) return `DM (with ${channel.recipient?.tag ?? shrug})`;
		else return `Group DM (${channel.name ?? shrug})`;
	}

	return channel.name;
}

export function channelBreadCrumbData(channel: TextBasedChannel | null) {
	return {
		'channel.id': channel?.id ?? shrug,
		'channel.name': channelName(channel)
	};
}

export function guildBreadCrumbData(guild: Guild | null) {
	return {
		'guild.id': guild?.id ?? shrug,
		'guild.name': guild?.name ?? shrug
	};
}

export function messageBreadCrumbs(message: MessageUnion) {
	return {
		'message.id': message.id,
		'message.type': message instanceof AkairoMessage ? 'slash' : 'normal',
		'message.parsed.content': message.util?.parsed?.content,
		...channelBreadCrumbData(message.channel),
		...guildBreadCrumbData(message.guild)
	};
}
