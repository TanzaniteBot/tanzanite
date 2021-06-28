/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec } from 'child_process';
import { Constants } from 'discord-akairo';
import { CommandInteraction, MessageEmbed, MessageEmbedOptions, Util } from 'discord.js';
import { transpile } from 'typescript';
import { inspect, promisify } from 'util';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushMessage } from '../../lib/extensions/BushMessage';
import { BushSlashMessage } from '../../lib/extensions/BushSlashMessage';

const clean = (text) => {
	if (typeof text === 'string') {
		return Util.cleanCodeBlockContent(text);
	} else return text;
};
const sh = promisify(exec);

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
					id: 'sel_depth',
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
					id: 'delete_msg',
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
					id: 'show_proto',
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
			slash: true,
			slashOptions: [
				{
					name: 'code',
					description: 'The code you would like to evaluate.',
					type: 'STRING',
					required: true
				},
				{
					name: 'sel_depth',
					description: 'How deep to display the output.',
					type: 'INTEGER',
					required: false
				},
				{
					name: 'sudo',
					description: 'Whether or not to override checks.',
					type: 'BOOLEAN',
					required: false
				},
				{
					name: 'silent',
					description: 'Whether or not to make the response silent',
					type: 'BOOLEAN',
					required: false
				},
				{
					name: 'typescript',
					description: 'Whether or not to compile the code from typescript.',
					type: 'BOOLEAN',
					required: false
				},
				{
					name: 'hidden',
					description: 'Whether or not to show hidden items.',
					type: 'BOOLEAN',
					required: false
				},
				{
					name: 'show_proto',
					description: 'Show prototype.',
					type: 'BOOLEAN',
					required: false
				}
			]
		});
	}

	public async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			sel_depth: number;
			code: string;
			sudo: boolean;
			silent: boolean;
			deleteMSG: boolean;
			typescript: boolean;
			hidden: boolean;
			show_proto: boolean;
		}
	): Promise<unknown> {
		if (!message.author.isOwner())
			return await message.util.reply(`${this.client.util.emojis.error} Only my developers can run this command.`);
		if (message.util.isSlash) {
			await (message as BushSlashMessage).interaction.defer({ ephemeral: args.silent });
		}

		const code: { js?: string | null; ts?: string | null; lang?: 'js' | 'ts' } = {};
		args.code = args.code.replace(/[“”]/g, '"');
		args.code = args.code.replace(/```/g, '');
		if (args.typescript) {
			code.ts = args.code;
			code.js = transpile(args.code);
			code.lang = 'ts';
		} else {
			code.ts = null;
			code.js = args.code;
			code.lang = 'js';
		}

		const embed: MessageEmbed = new MessageEmbed();
		const bad_phrases: string[] = ['delete', 'destroy'];

		function ae(old: string) {
			const mapping = {
				['token']: 'Token',
				['devToken']: 'Dev Token',
				['hypixelApiKey']: 'Hypixel Api Key'
			};
			return mapping[old] || old;
		}

		if (bad_phrases.some((p) => code[code.lang].includes(p)) && !args.sudo) {
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
				{ Ban } = await import('../../lib/models/Ban'),
				{ Global } = await import('../../lib/models/Global'),
				{ Guild } = await import('../../lib/models/Guild'),
				{ Level } = await import('../../lib/models/Level'),
				{ ModLog } = await import('../../lib/models/ModLog'),
				{ StickyRole } = await import('../../lib/models/StickyRole');
			if (code[code.lang].replace(/ /g, '').includes('9+10' || '10+9')) {
				output = 21;
			} else {
				output = eval(code.js);
				output = await output;
			}
			let proto, outputProto;
			if (args.show_proto) {
				proto = Object.getPrototypeOf(output);
				outputProto = clean(inspect(proto, { depth: 1, getters: true, showHidden: true }));
			}
			if (typeof output !== 'string')
				output = inspect(output, { depth: args.sel_depth || 0, showHidden: args.hidden, getters: true, showProxy: true });
			for (const credentialName in this.client.config.credentials) {
				const credential = this.client.config.credentials[credentialName];
				const newCredential = ae(credentialName);
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
			if (args.show_proto) embed.addField('⚙️ Proto', await this.client.util.codeblock(outputProto, 1024, 'js'));
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
		if (!args.silent && !message.util.isSlash) {
			await message.util.reply({ embeds: [embed], ephemeral: args.silent });
		} else if (message.util.isSlash) {
			await (message.interaction as CommandInteraction).editReply({ embeds: [embed] });
		} else {
			try {
				await message.author.send({ embeds: [embed] });
				if (!args.deleteMSG) await (message as BushMessage).react(this.client.util.emojis.successFull);
			} catch (e) {
				if (!args.deleteMSG) await (message as BushMessage).react(this.client.util.emojis.errorFull);
			}
		}

		if (args.deleteMSG && (message as BushMessage).deletable) {
			await (message as BushMessage).delete();
		}
	}
}
