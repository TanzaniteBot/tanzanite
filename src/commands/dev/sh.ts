/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BotCommand, colors, emojis, formatError, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import chalk from 'chalk';
import { ApplicationCommandOptionType, EmbedBuilder, cleanCodeBlockContent } from 'discord.js';
import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

assert(chalk != null);

const sh = promisify(exec);
const clean = (text: string | any) => {
	chalk.toString;
	if (typeof text === 'string') {
		return (text = cleanCodeBlockContent(text));
	} else return text;
};

export default class ShCommand extends BotCommand {
	public constructor() {
		super('sh', {
			aliases: ['sh', 'shell', 'cmd'],
			category: 'dev',
			description: 'Run shell commands.',
			usage: ['sh <command>'],
			examples: ['sh git pull'],
			args: [
				{
					id: 'command',
					description: 'The content you would like to run as a shell command.',
					type: 'string',
					match: 'rest',
					prompt: 'What would you like run',
					retry: '{error} Invalid command to run.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			ownerOnly: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { command: ArgType<'string'> }) {
		if (!this.client.config.owners.includes(message.author.id))
			return await message.util.reply(`${emojis.error} Only my developers can run this command.`);
		const input = clean(args.command);

		const embed = new EmbedBuilder()
			.setColor(colors.gray)
			.setFooter({ text: message.author.tag, iconURL: message.author.avatarURL() ?? undefined })
			.setTimestamp()
			.setTitle('Shell Command')
			.addFields(
				{ name: '📥 Input', value: await this.client.utils.codeblock(input, 1024, 'sh', true) },
				{ name: 'Running', value: emojis.loading }
			);

		await message.util.reply({ embeds: [embed] });

		/* const pattern = [
			'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
			'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
		].join('|');
		function strip(abc: string): string {
			return abc.replace(new RegExp(pattern, 'g'), '');
		} */
		try {
			const output = await sh(args.command, { env: { ...process.env, FORCE_COLOR: 'true' } });
			const stdout = /* strip( */ clean(output.stdout); /* ) */
			const stderr = /* strip( */ clean(output.stderr); /* ) */

			embed.setTitle(`${emojis.successFull} Executed command successfully.`).setColor(colors.success).spliceFields(1, 1);

			/* eslint-disable @typescript-eslint/strict-boolean-expressions */
			if (stdout) embed.addFields({ name: '📤 stdout', value: await this.client.utils.codeblock(stdout, 1024, 'ansi', true) });
			if (stderr) embed.addFields({ name: '📤 stderr', value: await this.client.utils.codeblock(stderr, 1024, 'ansi', true) });
			/* eslint-enable @typescript-eslint/strict-boolean-expressions */
		} catch (e) {
			embed.setTitle(`${emojis.errorFull} An error occurred while executing.`).setColor(colors.error).spliceFields(1, 1);

			embed.addFields({ name: '📤 Output', value: await this.client.utils.codeblock(formatError(e, true), 1024, 'ansi', true) });
		}
		await message.util.edit({ embeds: [embed] });
	}
}
