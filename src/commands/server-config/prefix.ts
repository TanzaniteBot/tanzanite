import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction, Message, Guild as DiscordGuild } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { SlashCommandOption } from '../../lib/extensions/Util';
import { Guild } from '../../lib/models';

export default class PrefixCommand extends BushCommand {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'server config',
			args: [
				{
					id: 'prefix'
				}
			],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content:
					'Set the prefix of the current server (resets to default if prefix is not given)',
				usage: 'prefix [prefix]',
				examples: ['prefix', 'prefix +']
			},
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.STRING,
					name: 'prefix',
					description: 'The prefix to set for this server',
					required: false
				}
			]
		});
	}

	async changePrefix(guild: DiscordGuild, prefix?: string): Promise<void> {
		if (prefix) {
			const row = await Guild.findByPk(guild.id);
			row.prefix = prefix;
			await row.save();
		} else {
			const row = await Guild.findByPk(guild.id);
			row.prefix = this.client.config.prefix;
			await row.save();
		}
	}

	async exec(message: Message, { prefix }: { prefix?: string }): Promise<void> {
		await this.changePrefix(message.guild, prefix);
		if (prefix) {
			await message.util.send(`Sucessfully set prefix to \`${prefix}\``);
		} else {
			await message.util.send(
				`Sucessfully reset prefix to \`${this.client.config.prefix}\``
			);
		}
	}

	async execSlash(
		message: CommandInteraction,
		{ prefix }: { prefix?: SlashCommandOption<string> }
	): Promise<void> {
		await this.changePrefix(message.guild, prefix?.value);
		if (prefix) {
			await message.reply(`Sucessfully set prefix to \`${prefix.value}\``);
		} else {
			await message.reply(
				`Sucessfully reset prefix to \`${this.client.config.prefix}\``
			);
		}
	}
}
