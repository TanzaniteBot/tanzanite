import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import chalk from 'chalk';
import { exec } from 'child_process';
import { ApplicationCommandOptionType, EmbedBuilder, Util } from 'discord.js';
import { promisify } from 'util';

assert(chalk);

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
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, { command }: { command: string }) {
		if (!client.config.owners.includes(message.author.id))
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);
		const input = clean(command);

		const embed = new EmbedBuilder()
			.setColor(util.colors.gray)
			.setFooter({ text: message.author.tag, iconURL: message.author.avatarURL() ?? undefined })
			.setTimestamp()
			.setTitle('Shell Command')
			.addFields([
				{ name: '📥 Input', value: await util.codeblock(input, 1024, 'sh', true) },
				{ name: 'Running', value: util.emojis.loading }
			]);

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

			if (stdout) embed.addFields([{ name: '📤 stdout', value: await util.codeblock(stdout, 1024, 'json', true) }]);
			if (stderr) embed.addFields([{ name: '📤 stderr', value: await util.codeblock(stderr, 1024, 'json', true) }]);
		} catch (e) {
			embed
				.setTitle(`${util.emojis.errorFull} An error occurred while executing.`)
				.setColor(util.colors.error)
				.spliceFields(1, 1);

			embed.addFields([{ name: '📤 Output', value: await util.codeblock(util.formatError(e), 1024, 'js', true) }]);
		}
		await message.util.edit({ embeds: [embed] });
	}
}
