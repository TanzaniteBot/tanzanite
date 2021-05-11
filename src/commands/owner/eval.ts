/* eslint-disable @typescript-eslint/no-unused-vars */
import { BotCommand } from '../../lib/extensions/BotCommand';
import { MessageEmbed, Message } from 'discord.js';
import { inspect, promisify } from 'util';
import { exec } from 'child_process';
import { BotMessage } from '../../lib/extensions/BotMessage';

const clean = (text) => {
	if (typeof text === 'string')
		return text
			.replace(/`/g, '`' + String.fromCharCode(8203))
			.replace(/@/g, '@' + String.fromCharCode(8203));
	else return text;
};

export default class EvalCommand extends BotCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval', 'ev'],
			category: 'dev',
			description: {
				content: 'Use the command to eval stuff in the bot.',
				usage: 'eval [--depth #] <code> [--sudo] [--silent] [--delete]',
				examples: ['eval message.guild.name', 'eval this.client.ownerID']
			},
			args: [
				{
					id: 'depth',
					match: 'option',
					type: 'number',
					flag: '--depth',
					default: 0
				},
				{
					id: 'silent',
					match: 'flag',
					flag: '--silent'
				},
				{
					id: 'code',
					match: 'rest',
					type: 'string',
					prompt: {
						start: 'What would you like to eval?',
						retry: 'Invalid code to eval. What would you like to eval?'
					}
				}
			],
			ownerOnly: true,
			clientPermissions: ['EMBED_LINKS']
		});
	}

	public async exec(
		message: BotMessage,
		{ depth, code, silent }: { depth: number; code: string; silent: boolean }
	): Promise<void> {
		const embed: MessageEmbed = new MessageEmbed();

		try {
			let output;
			const me = message.member,
				member = message.member,
				bot = this.client,
				guild = message.guild,
				channel = message.channel,
				config = this.client.config,
				sh = promisify(exec),
				models = this.client.db.models,
				got = await import('got');
			output = eval(code);
			output = await output;
			if (typeof output !== 'string') output = inspect(output, { depth });
			output = output.replace(
				new RegExp(this.client.token, 'g'),
				'[token omitted]'
			);
			output = clean(output);
			embed
				.setTitle('✅ Evaled code successfully')
				.addField(
					'📥 Input',
					code.length > 1012
						? 'Too large to display. Hastebin: ' +
								(await this.client.util.haste(code))
						: '```js\n' + code + '```'
				)
				.addField(
					'📤 Output',
					output.length > 1012
						? 'Too large to display. Hastebin: ' +
								(await this.client.util.haste(output))
						: '```js\n' + output + '```'
				)
				.setColor('#66FF00')
				.setFooter(
					message.author.username,
					message.author.displayAvatarURL({ dynamic: true })
				)
				.setTimestamp();
		} catch (e) {
			embed
				.setTitle('❌ Code was not able to be evaled')
				.addField(
					'📥 Input',
					code.length > 1012
						? 'Too large to display. Hastebin: ' +
								(await this.client.util.haste(code))
						: '```js\n' + code + '```'
				)
				.addField(
					'📤 Output',
					e.length > 1012
						? 'Too large to display. Hastebin: ' +
								(await this.client.util.haste(e))
						: '```js\n' +
								e +
								'```Full stack:' +
								(await this.client.util.haste(e.stack))
				)
				.setColor('#FF0000')
				.setFooter(
					message.author.username,
					message.author.displayAvatarURL({ dynamic: true })
				)
				.setTimestamp();
		}
		if (!silent) {
			await message.util.send(embed);
		} else {
			try {
				await message.author.send(embed);
				await message.react('<a:Check_Mark:790373952760971294>');
			} catch (e) {
				await message.react('❌');
			}
		}
	}
}
