/* eslint-disable @typescript-eslint/no-unused-vars */
import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { MessageEmbed, Message } from 'discord.js';
import { inspect, promisify } from 'util';
import { transpile } from 'typescript';
import { exec } from 'child_process';

const clean = text => {
	if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
	else return text;
};
const sh = promisify(exec);

export default class EvalCommand extends BushCommand {
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
					id: 'selDepth',
					match: 'option',
					type: 'number',
					flag: '--depth',
					default: 0
				},
				{
					id: 'sudo',
					match: 'flag',
					flag: '--sudo'
				},
				{
					id: 'deleteMSG',
					match: 'flag',
					flag: '--delete'
				},
				{
					id: 'silent',
					match: 'flag',
					flag: '--silent'
				},
				{
					id: 'typescript',
					match: 'flag',
					flag: '--ts'
				},
				{
					id: 'code',
					match: 'rest',
					type: 'string',
					prompt: {
						start: 'What would you like to eval?',
						retry: '<:no:787549684196704257> Invalid code to eval.'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			permissionLevel: PermissionLevel.Owner
		});
	}

	public async exec(
		message: Message,
		{
			selDepth,
			code: codeArg,
			sudo,
			silent,
			deleteMSG,
			typescript
		}: { selDepth: number; code: string; sudo: boolean; silent: boolean; deleteMSG: boolean; typescript: boolean }
	): Promise<unknown> {
		const code: { js?: string | null; ts?: string | null; lang?: 'js' | 'ts' } = {};
		codeArg = codeArg.replace(/[“”]/g, '"');
		if (typescript) {
			code.ts = codeArg;
			code.js = transpile(codeArg);
			code.lang = 'ts';
		} else {
			code.ts = null;
			code.js = codeArg;
			code.lang = 'js';
		}

		const embed: MessageEmbed = new MessageEmbed();
		const bad_phrases: string[] = ['delete', 'destroy'];

		function ae(old: string) {
			const mapping = {
				['token']: 'Token',
				['devToken']: 'Dev Token',
				['MongoDB']: 'MongoDB URI',
				['hypixelApiKey']: 'Hypixel Api Key',
				['webhookID']: 'Webhook ID',
				['webhookToken']: 'Webhook Token'
			};
			return mapping[old] || old;
		}

		if (!this.client.config.owners.includes(message.author.id)) return message.channel.send('<:no:787549684196704257> Only my owners can use this command.');
		if (bad_phrases.some(p => code[code.lang].includes(p)) && !sudo) return message.util.send('This eval was blocked by smooth brain protection™.');

		try {
			let output;
			const me = message.member,
				member = message.member,
				bot = this.client,
				guild = message.guild,
				channel = message.channel,
				config = this.client.config,
				db = await import('../../constants/db'),
				log = await import('../../lib/utils/log'),
				userOptionsSchema = await import('../../lib/utils/mongoose'),
				guildOptionsSchema = await import('../../lib/utils/mongoose'),
				globalOptionsSchema = await import('../../lib/utils/mongoose'),
				stickyRoleDataSchema = await import('../../lib/utils/mongoose');
			output = eval(code.js);
			output = await output;
			if (typeof output !== 'string') output = inspect(output, { depth: selDepth });
			for (const credentialName in this.client.credentials) {
				const credential = this.client.credentials[credentialName];
				const newCredential = ae(credentialName);
				output = output.replace(new RegExp(credential.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `[${newCredential} Omitted]`);
				output = output.replace(new RegExp([...credential.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')].reverse().join(''), 'g'), `[${newCredential} Omitted]`);
			}
			output = clean(output);
			embed
				.setTitle('✅ Evaled code successfully')
				.setColor('#66FF00')
				.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
			if (code.lang === 'ts') {
				embed
					.addField(
						'📥 Input (typescript)',
						code.ts.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code.ts)) : '```ts\n' + code.ts + '```'
					)
					.addField(
						'📥 Input (transpiled javascript)',
						code.js.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code.js)) : '```ts\n' + code.js + '```'
					);
			} else {
				embed.addField('📥 Input', code.js.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code.js)) : '```js\n' + code.js + '```');
			}
			embed.addField('📤 Output', output.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(output)) : '```js\n' + output + '```');
		} catch (e) {
			embed
				.setTitle('❌ Code was not able to be evaled')
				.setColor('#FF0000')
				.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();

			if (code.lang === 'ts') {
				embed
					.addField(
						'📥 Input (typescript)',
						code.ts.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code.ts)) : '```ts\n' + code.ts + '```'
					)
					.addField(
						'📥 Input (transpiled javascript)',
						code.js.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code.js)) : '```ts\n' + code.js + '```'
					);
			} else {
				embed.addField('📥 Input', code.js.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(code.js)) : '```js\n' + code.js + '```');
			}
			embed.addField('📤 Output', e.stack.length > 1012 ? 'Too large to display. Hastebin: ' + (await this.client.consts.haste(e.stack)) : '```js\n' + e.stack + '```');
		}
		if (!silent) {
			await message.util.reply(embed);
		} else {
			try {
				await message.author.send(embed);
				if (!deleteMSG) {
					await message.react('<a:Check_Mark:790373952760971294>');
				}
			} catch (e) {
				if (!deleteMSG) {
					await message.react('❌');
				}
			}
		}

		if (deleteMSG) {
			if (message.deletable) {
				await message.delete();
			}
		}
	}
}
