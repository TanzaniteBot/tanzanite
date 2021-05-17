import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction, Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { Guild } from '../../lib/models';

export default class PrefixCommand extends BotCommand {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
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
	async exec(message: Message, { prefix }: { prefix?: string }): Promise<void> {
		if (prefix) {
			const row = await Guild.findByPk(message.guild.id);
			row.prefix = prefix;
			await row.save();
			await message.util.send(`Sucessfully set prefix to \`${prefix}\``);
		} else {
			const row = await Guild.findByPk(message.guild.id);
			row.prefix = this.client.config.prefix;
			await row.save();
			await message.util.send(
				`Sucessfully reset prefix to \`${this.client.config.prefix}\``
			);
		}
	}

	async execSlash(message: CommandInteraction): Promise<void> {
		const prefix = message.options.find((o) => o.name === 'prefix')?.value as
			| string
			| undefined;

		if (prefix) {
			const row = await Guild.findByPk(message.guild.id);
			row.prefix = prefix;
			await row.save();
			await message.reply(`Sucessfully set prefix to \`${prefix}\``);
		} else {
			const row = await Guild.findByPk(message.guild.id);
			row.prefix = this.client.config.prefix;
			await row.save();
			await message.reply(
				`Sucessfully reset prefix to \`${this.client.config.prefix}\``
			);
		}
	}
}
