import { BushCommandHandlerEvents, BushListener, BushMessage } from '@lib';

export default class CommandBlockedListener extends BushListener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked'
		});
	}

	public async exec(...[message, command, reason]: BushCommandHandlerEvents['commandBlocked']): Promise<unknown> {
		return await CommandBlockedListener.handleBlocked(message, command, reason);
	}

	public static async handleBlocked(
		...[message, command, reason]: BushCommandHandlerEvents['commandBlocked'] | BushCommandHandlerEvents['slashBlocked']
	): Promise<unknown> {
		const isSlash = message.util.isSlash;

		void client.console.info(
			`${isSlash ? 'Slash' : 'Command'}Blocked`,
			`<<${message.author.tag}>> tried to run <<${command}>> but was blocked because <<${reason}>>.`,
			true
		);
		const reasons = client.consts.BlockedReasons;

		switch (reason) {
			case reasons.OWNER: {
				return await message.util.reply({
					content: `${util.emojis.error} Only my developers can run the \`${command}\` command.`,
					ephemeral: true
				});
			}
			case reasons.SUPER_USER: {
				return await message.util.reply({
					content: `${util.emojis.error} You must be a superuser to run the \`${command}\` command.`,
					ephemeral: true
				});
			}
			case reasons.DISABLED_GLOBAL: {
				return await message.util.reply({
					content: `${util.emojis.error} My developers disabled the \`${command}\` command.`,
					ephemeral: true
				});
			}
			case reasons.DISABLED_GUILD: {
				return await message.util.reply({
					content: `${util.emojis.error} The \`${command}\` command is currently disabled in \`${message.guild.name}\`.`,
					ephemeral: true
				});
			}
			case reasons.CHANNEL_GLOBAL_BLACKLIST:
			case reasons.CHANNEL_GUILD_BLACKLIST:
				return isSlash
					? message.util.reply({ content: `${util.emojis.error} You cannot use this bot in this channel.`, ephemeral: true })
					: (message as BushMessage).react(util.emojis.error);
			case reasons.USER_GLOBAL_BLACKLIST:
			case reasons.USER_GUILD_BLACKLIST:
				return isSlash
					? message.util.reply({ content: `${util.emojis.error} You are blacklisted from using this bot.`, ephemeral: true })
					: (message as BushMessage).react(util.emojis.error);
			case reasons.ROLE_BLACKLIST: {
				return isSlash
					? message.util.reply({
							content: `${util.emojis.error} One of your roles blacklists you from using this bot.`,
							ephemeral: true
					  })
					: (message as BushMessage).react(util.emojis.error);
			}
			case reasons.RESTRICTED_CHANNEL: {
				const channels = command.restrictedChannels;
				const names = [];
				channels.forEach((c) => {
					names.push(`<#${c}>`);
				});
				const pretty = util.oxford(names, 'and', undefined);
				return await message.util.reply({
					content: `${util.emojis.error} \`${command}\` can only be run in ${pretty}.`,
					ephemeral: true
				});
			}
			case reasons.RESTRICTED_GUILD: {
				const guilds = command.restrictedGuilds;
				const names = [];
				guilds.forEach((g) => {
					names.push(`\`${client.guilds.cache.get(g).name}\``);
				});
				const pretty = util.oxford(names, 'and', undefined);
				return await message.util.reply({
					content: `${util.emojis.error} \`${command}\` can only be run in ${pretty}.`,
					ephemeral: true
				});
			}
			default: {
				return await message.util.reply({
					content: `${util.emojis.error} Command blocked with reason \`${reason}\``,
					ephemeral: true
				});
			}
		}
	}
}
