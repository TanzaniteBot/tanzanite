import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import chalk from 'chalk';
import { exec } from 'child_process';
import { Constants } from 'discord-akairo';
import { MessageEmbed, Util } from 'discord.js';
import { promisify } from 'util';

const sh = promisify(exec);
const clean = (text) => {
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
					type: Constants.ArgumentTypes.STRING,
					match: Constants.ArgumentMatches.REST,
					prompt: {
						start: 'What would you like run',
						retry: '{error} Invalid command to run.'
					}
				}
			],
			ownerOnly: true
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, { command }: { command: string }): Promise<unknown> {
		if (!this.client.config.owners.includes(message.author.id))
			return await message.util.reply(`${this.client.util.emojis.error} Only my developers can run this command.`);
		const input = clean(command);

		const embed = new MessageEmbed()
			.setColor(this.client.util.colors.gray)
			.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
			.setTimestamp()
			.setTitle('Shell Command')
			.addField('📥 Input', await this.client.util.codeblock(input, 1024, 'sh'))
			.addField('Running', this.client.util.emojis.loading);

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
				.setTitle(`${this.client.util.emojis.successFull} Executed command successfully.`)
				.setColor(this.client.util.colors.success)
				.spliceFields(1, 1);

			if (stdout) embed.addField('📤 stdout', await this.client.util.codeblock(stdout, 1024, 'json'));
			if (stderr) embed.addField('📤 stderr', await this.client.util.codeblock(stderr, 1024, 'json'));
		} catch (e) {
			embed
				.setTitle(`${this.client.util.emojis.errorFull} An error occurred while executing.`)
				.setColor(this.client.util.colors.error)
				.spliceFields(1, 1);

			embed.addField('📤 Output', await this.client.util.codeblock(e?.stack, 1024, 'js'));
		}
		await message.util.edit({ embeds: [embed] });
	}
}
