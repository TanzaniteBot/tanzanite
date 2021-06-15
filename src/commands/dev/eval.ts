/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec } from 'child_process';
import { Constants } from 'discord-akairo';
import { Message, MessageEmbed, MessageEmbedOptions, Util } from 'discord.js';
import { transpile } from 'typescript';
import { inspect, promisify } from 'util';
import { BushCommand } from '../../lib/extensions/BushCommand';

const clean = (text) => {
	if (typeof text === 'string') {
		return (text = Util.cleanCodeBlockContent(text));
	} else return text;
};
export default class EvalCommand extends BushCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval', 'ev'],
			category: 'dev',
			description: {
				content: 'Use the command to eval stuff in the bot.',
				usage: 'eval [--depth #] <code> [--sudo] [--silent] [--delete] [--proto] [--hidden] [--ts]',
				examples: ['eval message.guild.name', 'eval this.client.ownerID']
			},
			args: [
				{
					id: 'selDepth',
					match: Constants.ArgumentMatches.OPTION,
					type: Constants.ArgumentTypes.NUMBER,
					flag: '--depth',
					default: 0
				},
				{
					id: 'sudo',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--sudo'
				},
				{
					id: 'deleteMSG',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--delete'
				},
				{
					id: 'silent',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--silent'
				},
				{
					id: 'typescript',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--ts'
				},
				{
					id: 'hidden',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--hidden'
				},
				{
					id: 'showProto',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--proto'
				},
				{
					id: 'code',
					match: Constants.ArgumentMatches.REST,
					type: Constants.ArgumentTypes.STRING,
					prompt: {
						start: 'What would you like to eval?',
						retry: '{error} Invalid code to eval.'
					}
				}
			],
			ownerOnly: true,
			clientPermissions: ['EMBED_LINKS']
		});
	}

	private redactCredentials(old: string) {
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

	public async exec(
		message: Message,
		{
			selDepth,
			code: codeArg,
			sudo,
			silent,
			deleteMSG,
			typescript,
			hidden,
			showProto
		}: {
			selDepth: number;
			code: string;
			sudo: boolean;
			silent: boolean;
			deleteMSG: boolean;
			typescript: boolean;
			hidden: boolean;
			showProto: boolean;
		}
	): Promise<unknown> {
		if (!this.client.config.owners.includes(message.author.id))
			return await message.channel.send(`${this.client.util.emojis.error} Only my developers can run this command.`);
		const code: { js?: string | null; ts?: string | null; lang?: 'js' | 'ts' } = {};
		codeArg = codeArg.replace(/[“”]/g, '"');
		codeArg = codeArg.replace(/```/g, '');
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
		if (bad_phrases.some((p) => code[code.lang].includes(p)) && !sudo) {
			return await message.util.send(`${this.client.util.emojis.error} This eval was blocked by smooth brain protection™.`);
		}
		const embeds: (MessageEmbed | MessageEmbedOptions)[] = [new MessageEmbed()];
		embeds.some((embed) => embed);

		try {
			let output;
			const me = message.member,
				member = message.member,
				bot = this.client,
				guild = message.guild,
				channel = message.channel,
				config = this.client.config,
				members = message.guild.members,
				roles = message.guild.roles,
				sh = promisify(exec),
				models = this.client.db.models,
				got = require('got'); // eslint-disable-line @typescript-eslint/no-var-requires
			if (code[code.lang].replace(/ /g, '').includes('9+10' || '10+9')) {
				output = 21;
			} else {
				output = eval(code.js);
				output = await output;
			}
			let proto, outputProto;
			if (showProto) {
				proto = Object.getPrototypeOf(output);
				outputProto = clean(inspect(proto, { depth: 1, getters: true, showHidden: true }));
			}
			if (typeof output !== 'string')
				output = inspect(output, { depth: selDepth, showHidden: hidden, getters: true, showProxy: true });
			for (const credentialName in this.client.config.credentials) {
				const credential = this.client.config.credentials[credentialName];
				const newCredential = this.redactCredentials(credentialName);
				output = output.replace(
					new RegExp(credential.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
					`[${newCredential} Omitted]`
				);
				output = output.replace(
					new RegExp([...credential.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')].reverse().join(''), 'g'),
					`[${newCredential} Omitted]`
				);
			}

			output = clean(output);
			const inputJS = clean(code.js);

			embed
				.setTitle(`${this.client.util.emojis.successFull} Evaled code successfully`)
				.setColor(this.client.util.colors.success)
				.setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
			if (code.lang === 'ts') {
				const inputTS = clean(code.ts);
				embed
					.addField('📥 Input (typescript)', await this.client.util.codeblock(inputTS, 1024, 'ts'))
					.addField('📥 Input (transpiled javascript)', await this.client.util.codeblock(inputJS, 1024, 'js'));
			} else {
				embed.addField('📥 Input', await this.client.util.codeblock(inputJS, 1024, 'js'));
			}
			embed.addField('📤 Output', await this.client.util.codeblock(output, 1024, 'js'));
			if (showProto) embed.addField('⚙️ Proto', await this.client.util.codeblock(outputProto, 1024, 'js'));
		} catch (e) {
			const inputJS = clean(code.js);
			embed
				.setTitle(`${this.client.util.emojis.errorFull} Code was not able to be evaled.`)
				.setColor(this.client.util.colors.error)
				.setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp();
			if (code.lang === 'ts') {
				const inputTS = clean(code.ts);
				embed
					.addField('📥 Input (typescript)', await this.client.util.codeblock(inputTS, 1024, 'ts'))
					.addField('📥 Input (transpiled javascript)', await this.client.util.codeblock(inputJS, 1024, 'js'));
			} else {
				embed.addField('📥 Input', await this.client.util.codeblock(inputJS, 1024, 'js'));
			}
			embed.addField('📤 Output', await this.client.util.codeblock(e?.stack, 1024, 'js'));
		}
		if (!silent) {
			await message.util.reply({ embeds: [embed] });
		} else {
			try {
				await message.author.send({ embeds: [embed] });
				if (!deleteMSG) await message.react(this.client.util.emojis.successFull);
			} catch (e) {
				if (!deleteMSG) await message.react(this.client.util.emojis.errorFull);
			}
		}

		if (deleteMSG && message.deletable) {
			await message.delete();
		}
	}
}
