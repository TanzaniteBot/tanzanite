/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ActivePunishment,
	BushCommand,
	BushMessage,
	BushSlashMessage,
	Global,
	Guild,
	Level,
	ModLog,
	Shared,
	StickyRole,
	type ArgType
} from '#lib';
import { Snowflake as Snowflake_ } from '@sapphire/snowflake';
import { Canvas } from 'canvas';
import { exec } from 'child_process';
import {
	ActionRow,
	ApplicationCommandOptionType,
	ButtonComponent,
	ButtonInteraction,
	Collection,
	Collector,
	CommandInteraction,
	ContextMenuCommandInteraction,
	DMChannel,
	Embed,
	Emoji,
	Interaction,
	InteractionCollector,
	Message,
	MessageAttachment,
	MessageCollector,
	PermissionsBitField,
	ReactionCollector,
	SelectMenuComponent,
	Util
} from 'discord.js';
import ts from 'typescript';
import { promisify } from 'util';
const { transpile } = ts,
	emojis = util.emojis,
	colors = util.colors,
	sh = promisify(exec),
	SnowflakeUtil = new Snowflake_(1420070400000n);
/* eslint-enable @typescript-eslint/no-unused-vars */

export default class EvalCommand extends BushCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval', 'ev', 'evaluate'],
			category: 'dev',
			description: 'Evaluate code.',
			usage: ['eval <code> [--depth #] [--sudo] [--silent] [--delete] [--proto] [--hidden] [--ts]'],
			examples: ['eval message.channel.delete()'],
			args: [
				{
					id: 'code',
					description: 'The code you would like to evaluate.',
					match: 'rest',
					prompt: 'What would you like to eval?',
					retry: '{error} Invalid code to eval.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'sel_depth',
					description: 'How deep to inspect the output.',
					match: 'option',
					type: 'integer',
					flag: '--depth',
					default: 0,
					prompt: 'How deep would you like to inspect the output?',
					slashType: ApplicationCommandOptionType.Integer,
					optional: true
				},
				{
					id: 'sudo',
					description: 'Whether or not to override checks.',
					match: 'flag',
					flag: '--sudo',
					prompt: 'Would you like to override checks?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'delete_msg',
					description: 'Whether or not to delete the message that invoked the command.',
					match: 'flag',
					flag: '--delete',
					prompt: 'Would you like to delete the message that invoked the command?',
					slashType: false,
					optional: true,
					only: 'text'
				},
				{
					id: 'silent',
					description: 'Whether or not to make the response silent',
					match: 'flag',
					flag: '--silent',
					prompt: 'Would you like to make the response silent?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'typescript',
					description: 'Whether or not to treat the code as typescript and transpile it.',
					match: 'flag',
					flag: '--ts',
					prompt: 'Is this code written in typescript?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'hidden',
					description: 'Whether or not to show hidden items.',
					match: 'flag',
					flag: '--hidden',
					prompt: 'Would you like to show hidden items?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'show_proto',
					description: 'Whether or not to show the prototype of the output.',
					match: 'flag',
					flag: '--proto',
					prompt: 'Would you like to show the prototype of the output?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'show_methods',
					description: 'Whether or not to inspect the prototype chain for methods.',
					match: 'flag',
					flag: ['--func', '--function', '--functions', '--meth', '--method', '--methods'],
					prompt: 'Would you like to inspect the prototype chain to find methods?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'async',
					description: 'Whether or not to wrap the code in an async function.',
					match: 'flag',
					flag: '--async',
					prompt: 'Would you like to wrap the code in an async function?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'no_inspect_strings',
					description: 'Whether to not inspect strings.',
					match: 'flag',
					flag: ['--strings', '--string'],
					prompt: 'Would you like to not inspect strings?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			ownerOnly: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			code: ArgType<'string'>;
			sel_depth: ArgType<'integer'>;
			sudo: ArgType<'boolean'>;
			silent: ArgType<'boolean'>;
			deleteMSG: ArgType<'boolean'>;
			typescript: ArgType<'boolean'>;
			hidden: ArgType<'boolean'>;
			show_proto: ArgType<'boolean'>;
			show_methods: ArgType<'boolean'>;
			async: ArgType<'boolean'>;
			no_inspect_strings: ArgType<'boolean'>;
		}
	) {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);
		if (message.util.isSlashMessage(message)) {
			await message.interaction.deferReply({ ephemeral: args.silent });
		}
		const isTypescript = args.typescript || args.code.includes('```ts');
		let rawCode = args.code.replace(/[“”]/g, '"').replace(/```*(?:js|ts)?/g, '');
		if (args.async) rawCode = `(async () => {${rawCode}})()`;

		const code: { ts: string | null; js: string; lang: 'ts' | 'js' } = {
			ts: isTypescript ? rawCode : null,
			js: isTypescript ? transpile(rawCode) : rawCode,
			lang: isTypescript ? 'ts' : 'js'
		};

		const embed = new Embed();
		const badPhrases = ['delete', 'destroy'];

		if (badPhrases.some((p) => code[code.lang]!.includes(p)) && !args.sudo) {
			return await message.util.send(`${util.emojis.error} This eval was blocked by smooth brain protection™.`);
		}

		/* eslint-disable @typescript-eslint/no-unused-vars */
		const me = message.member,
			member = message.member,
			bot = client,
			guild = message.guild,
			channel = message.channel,
			config = client.config,
			members = message.guild?.members,
			roles = message.guild?.roles;
		/* eslint-enable @typescript-eslint/no-unused-vars */

		const inputJS = await util.inspectCleanRedactCodeblock(code.js, 'js');
		const inputTS = code.lang === 'ts' ? await util.inspectCleanRedactCodeblock(code.ts, 'ts') : undefined;
		try {
			const rawOutput = /^(9\s*?\+\s*?10)|(10\s*?\+\s*?9)$/.test(code[code.lang]!) ? '21' : await eval(code.js);
			const output = await util.inspectCleanRedactCodeblock(rawOutput, 'js', {
				depth: args.sel_depth ?? 0,
				showHidden: args.hidden,
				getters: true,
				showProxy: true,
				inspectStrings: !args.no_inspect_strings
			});
			const methods = args.show_methods ? await util.inspectCleanRedactCodeblock(util.getMethods(rawOutput), 'js') : undefined;
			const proto = args.show_proto
				? await util.inspectCleanRedactCodeblock(Object.getPrototypeOf(rawOutput), 'js', {
						depth: 1,
						getters: true,
						showHidden: true
				  })
				: undefined;

			embed.setTitle(`${emojis.successFull} Successfully Evaluated Expression`).setColor(colors.success);
			if (inputTS)
				embed
					.addField({ name: '📥 Input (typescript)', value: inputTS })
					.addField({ name: '📥 Input (transpiled javascript)', value: inputJS });
			else embed.addField({ name: '📥 Input', value: inputJS });
			embed.addField({ name: '📤 Output', value: output });
			if (methods) embed.addField({ name: '🔧 Methods', value: methods });
			if (proto) embed.addField({ name: '⚙️ Proto', value: proto });
		} catch (e) {
			embed.setTitle(`${emojis.errorFull} Unable to Evaluate Expression`).setColor(colors.error);
			if (inputTS)
				embed
					.addField({ name: '📥 Input (typescript)', value: inputTS })
					.addField({ name: '📥 Input (transpiled javascript)', value: inputJS });
			else embed.addField({ name: '📥 Input', value: inputJS });
			embed.addField({ name: '📤 Error', value: await util.inspectCleanRedactCodeblock(e, 'js') });
		}

		embed.setTimestamp().setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() ?? undefined });

		if (!args.silent || message.util.isSlashMessage(message)) {
			await message.util.reply({ embeds: [embed] });
		} else {
			try {
				await message.author.send({ embeds: [embed] });
				if (!args.deleteMSG) await message.react(emojis.successFull);
			} catch {
				if (!args.deleteMSG) await message.react(emojis.errorFull);
			}
		}
		if (args.deleteMSG && 'deletable' in message && message.deletable) await message.delete();
	}
}

/** @typedef {ActivePunishment|Global|Guild|Level|ModLog|StickyRole|ButtonInteraction|Collection|Collector|CommandInteraction|ContextMenuCommandInteraction|DMChannel|Emoji|Interaction|InteractionCollector|Message|ActionRow|MessageAttachment|ButtonComponent|MessageCollector|SelectMenuComponent|ReactionCollector|Util|Canvas|Shared|PermissionsBitField} VSCodePleaseDontRemove */
