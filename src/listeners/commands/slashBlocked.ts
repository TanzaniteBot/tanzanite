import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class SlashBlockedListener extends BushListener {
	public constructor() {
		super('slashBlocked', {
			emitter: 'commandHandler',
			event: 'slashBlocked',
			category: 'commands'
		});
	}

	public async exec(...[message, command, reason]: BushCommandHandlerEvents['slashBlocked']): Promise<unknown> {
		this.client.console.info(
			'SlashBlocked',
			`<<${message.author.tag}>> tried to run <<${message.util.parsed.command}>> but was blocked because <<${reason}>>.`,
			true
		);

		const reasons = this.client.consts.BlockedReasons;

		switch (reason) {
			case reasons.OWNER: {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} Only my developers can run the \`${message.util.parsed.command}\` command.`
				});
			}
			case reasons.SUPER_USER: {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} You must be a superuser to run the \`${message.util.parsed.command}\` command.`
				});
			}
			case reasons.DISABLED_GLOBAL: {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} My developers disabled the \`${message.util.parsed.command}\` command.`
				});
			}
			case reasons.DISABLED_GUILD: {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} The \`${command.aliases[0]}\` command is currently disabled in \`${message.guild.name}\`.`
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
				const pretty = this.client.util.oxford(names, 'and', undefined);
				return await message.util.reply({
					content: `${this.client.util.emojis.error} \`${command}\` can only be run in ${pretty}.`
				});
			}
			case reasons.RESTRICTED_GUILD: {
				const guilds = command.restrictedGuilds;
				const names = [];
				guilds.forEach((g) => {
					names.push(`\`${this.client.guilds.cache.get(g).name}\``);
				});
				const pretty = this.client.util.oxford(names, 'and', undefined);
				return await message.util.reply({
					content: `${this.client.util.emojis.error} \`${command}\` can only be run in ${pretty}.`
				});
			}
			default: {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} Command blocked with reason \`${reason}\``
				});
			}
		}
	}
}
