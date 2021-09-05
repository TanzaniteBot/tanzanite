import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import chalk from 'chalk';
import { exec } from 'child_process';
import { MessageEmbed, Util } from 'discord.js';
import { promisify } from 'util';

const sh = promisify(exec);
const clean = (text: string | any) => {
	chalk.toString;
	if (typeof text === 'string') {
		return (text = Util.cleanCodeBlockContent(text));
	} else return text;
};

export default class ShCommand extends BushCommand {
	public constructor() {
		super('sh', {
			aliases: ['sh', 'shell', 'cmd'],
			category: 'dev',
			description: {
				content: 'Run shell commands.',
				usage: 'sh <command>',
				examples: ['sh git pull']
			},
			args: [
				{
					id: 'command',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'What would you like run',
						retry: '{error} Invalid command to run.'
					}
				}
			],
			ownerOnly: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, { command }: { command: string }): Promise<unknown> {
		if (!client.config.owners.includes(message.author.id))
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);
		const input = clean(command);

		const embed = new MessageEmbed()
			.setColor(util.colors.gray)
			.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }) ?? undefined)
			.setTimestamp()
			.setTitle('Shell Command')
			.addField('📥 Input', await util.codeblock(input, 1024, 'sh', true))
			.addField('Running', util.emojis.loading);

		await message.util.reply({ embeds: [embed] });

		const pattern = [
			'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
			'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
		].join('|');
		function strip(abc: string): string {
			return abc.replace(new RegExp(pattern, 'g'), '');
		}
		try {
			const output = await sh(command);
			const stdout = strip(clean(output.stdout));
			const stderr = strip(clean(output.stderr));

			embed
				.setTitle(`${util.emojis.successFull} Executed command successfully.`)
				.setColor(util.colors.success)
				.spliceFields(1, 1);

			if (stdout) embed.addField('📤 stdout', await util.codeblock(stdout, 1024, 'json', true));
			if (stderr) embed.addField('📤 stderr', await util.codeblock(stderr, 1024, 'json', true));
		} catch (e) {
			embed
				.setTitle(`${util.emojis.errorFull} An error occurred while executing.`)
				.setColor(util.colors.error)
				.spliceFields(1, 1);

			embed.addField('📤 Output', await util.codeblock(e?.stack, 1024, 'js', true));
		}
		await message.util.edit({ embeds: [embed] });
	}
}
