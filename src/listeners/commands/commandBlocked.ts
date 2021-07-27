import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class CommandBlockedListener extends BushListener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked'
		});
	}

	public async exec(...[message, command, reason]: BushCommandHandlerEvents['commandBlocked']): Promise<unknown> {
		void client.console.info(
			'CommandBlocked',
			`<<${message.author.tag}>> tried to run <<${message.util.parsed.command}>> but was blocked because <<${reason}>>.`,
			true
		);
		const reasons = client.consts.BlockedReasons;

		switch (reason) {
			case reasons.OWNER: {
				return await message.util.reply({
					content: `${util.emojis.error} Only my developers can run the \`${message.util.parsed.command}\` command.`
				});
			}
			case reasons.SUPER_USER: {
				return await message.util.reply({
					content: `${util.emojis.error} You must be a superuser to run the \`${message.util.parsed.command}\` command.`
				});
			}
			case reasons.DISABLED_GLOBAL: {
				return await message.util.reply({
					content: `${util.emojis.error} My developers disabled the \`${message.util.parsed.command}\` command.`
				});
			}
			case reasons.DISABLED_GUILD: {
				return await message.util.reply({
					content: `${util.emojis.error} The \`${command.aliases[0]}\` command is currently disabled in \`${message.guild.name}\`.`
				});
			}
			case reasons.CHANNEL_GLOBAL_BLACKLIST:
			case reasons.CHANNEL_GUILD_BLACKLIST:
			case reasons.USER_GLOBAL_BLACKLIST:
			case reasons.USER_GUILD_BLACKLIST:
			case reasons.ROLE_BLACKLIST: {
				return;
			}
			case reasons.RESTRICTED_CHANNEL: {
				const channels = command.restrictedChannels;
				const names = [];
				channels.forEach((c) => {
					names.push(`<#${c}>`);
				});
				const pretty = util.oxford(names, 'and', undefined);
				return await message.util.reply({
					content: `${util.emojis.error} \`${command}\` can only be run in ${pretty}.`
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
					content: `${util.emojis.error} \`${command}\` can only be run in ${pretty}.`
				});
			}
			default: {
				return await message.util.reply({
					content: `${util.emojis.error} Command blocked with reason \`${reason}\``
				});
			}
		}
	}
}
