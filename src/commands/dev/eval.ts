/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ActivePunishment,
	assertAll,
	BushCommand,
	BushInspectOptions,
	CodeBlockLang,
	colors,
	emojis,
	getMethods,
	Global,
	Guild,
	Level,
	ModLog,
	Shared,
	StickyRole,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { Snowflake as Snowflake_ } from '@sapphire/snowflake';
import assert from 'assert/strict';
import { Canvas } from 'canvas';
import { exec } from 'child_process';
import {
	ActionRow,
	ApplicationCommandOptionType,
	Attachment,
	ButtonComponent,
	ButtonInteraction,
	Collection,
	Collector,
	CommandInteraction,
	ContextMenuCommandInteraction,
	DMChannel,
	Embed,
	EmbedBuilder,
	Emoji,
	InteractionCollector,
	Message,
	MessageCollector,
	OAuth2Scopes,
	PermissionFlagsBits,
	PermissionsBitField,
	ReactionCollector,
	SelectMenuComponent
} from 'discord.js';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
const { transpile } = ts,
	sh = promisify(exec),
	SnowflakeUtil = new Snowflake_(1420070400000n),
	__dirname = path.dirname(fileURLToPath(import.meta.url));
/* eslint-enable @typescript-eslint/no-unused-vars */

// prettier-ignore
assertAll(ActivePunishment, BushCommand, Global, Guild, Level, ModLog, Shared, StickyRole, Snowflake_, Canvas, exec, ActionRow, ButtonComponent, ButtonInteraction, Collection, Collector, CommandInteraction, ContextMenuCommandInteraction, DMChannel, Embed, Emoji, InteractionCollector, Message, Attachment, MessageCollector, OAuth2Scopes, PermissionFlagsBits, PermissionsBitField, ReactionCollector, SelectMenuComponent, path, ts, fileURLToPath, promisify, assert, transpile, sh, SnowflakeUtil, __dirname);

export default class EvalCommand extends BushCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval', 'ev', 'evaluate'],
			category: 'dev',
			description: 'Evaluate code.',
			usage: [
				'eval <code> [--depth #] [--sudo] [--delete] [--silent] [--ts] [--hidden] [--proto] [--methods] [--async] [--strings]'
			],
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
					flag: ['--ts', '--typescript'],
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
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{
			code: argCode,
			sel_depth: selDepth,
			sudo,
			silent,
			delete_msg: deleteMsg,
			typescript,
			hidden,
			show_proto: showProto,
			show_methods: showMethods,
			async,
			no_inspect_strings: noInspectStrings
		}: {
			code: ArgType<'string'>;
			sel_depth: ArgType<'integer'>;
			sudo: ArgType<'flag'>;
			silent: ArgType<'flag'>;
			delete_msg: ArgType<'flag'>;
			typescript: ArgType<'flag'>;
			hidden: ArgType<'flag'>;
			show_proto: ArgType<'flag'>;
			show_methods: ArgType<'flag'>;
			async: ArgType<'flag'>;
			no_inspect_strings: ArgType<'flag'>;
		}
	) {
		if (!message.author.isOwner()) return await message.util.reply(`${emojis.error} Only my developers can run this command.`);
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply({ ephemeral: silent });

		if (!sudo && ['delete', 'destroy'].some((p) => argCode.includes(p))) {
			return await message.util.send(`${emojis.error} This eval was blocked by smooth brain protection™.`);
		}

		const isTypescript = typescript || argCode.includes('```ts');
		let rawCode = argCode.replace(/[“”]/g, '"').replace(/```*(?:js|ts)?/g, '');
		if (async) {
			if (rawCode.includes(';') && (!rawCode.endsWith(';') || rawCode.includes('\n') || rawCode.split(';').length > 2))
				rawCode = `(async () => {${rawCode}})()`;
			else rawCode = `(async () => { return ${rawCode} })()`;
		}

		const code = {
			ts: isTypescript ? rawCode : null,
			js: isTypescript ? this.transpile(rawCode) : rawCode,
			lang: isTypescript ? ('ts' as const) : ('js' as const)
		};

		const embed = new EmbedBuilder().setFooter({
			text: message.author.tag,
			iconURL: message.author.displayAvatarURL() ?? undefined
		});

		let err = false;
		let rawResult: any;

		try {
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const me = message.member,
				member = message.member,
				bot = this.client,
				client = this.client,
				guild = message.guild,
				channel = message.channel,
				config = this.client.config,
				members = message.guild?.members,
				roles = message.guild?.roles;
			/* eslint-enable @typescript-eslint/no-unused-vars */

			rawResult = /^(9\s*?\+\s*?10)|(10\s*?\+\s*?9)$/.test(code[code.lang]!) ? '21' : await eval(code.js);
		} catch (e) {
			err = true;
			rawResult = e;
		}

		const inputJS = await this.codeblock(code.js, 'js');
		const inputTS = code.lang === 'ts' ? await this.codeblock(code.ts, 'ts') : undefined;

		embed.setTimestamp();

		if (inputTS) embed.addFields({ name: ':inbox_tray: Input (typescript)', value: inputTS });
		embed.addFields({ name: `:inbox_tray: Input${inputTS ? ' (transpiled javascript)' : ''}`, value: inputJS });

		const output = await this.codeblock(rawResult, 'js', {
			depth: selDepth ?? 0,
			showHidden: hidden,
			showProxy: true,
			inspectStrings: !noInspectStrings,
			colors: false
		});

		const methods = !err && showMethods ? await this.codeblock(rawResult, 'ts', { methods: true }) : undefined;
		const proto = !err && showProto ? await this.codeblock(rawResult, 'js', { showHidden: true, prototype: true }) : undefined;

		embed
			.setTitle(`${emojis[err ? 'errorFull' : 'successFull']} ${err ? 'Uns' : 'S'}uccessfully Evaluated Expression`)
			.setColor(colors[err ? 'error' : 'success'])
			.addFields({ name: `:outbox_tray: ${err ? 'Error' : 'Output'}`, value: output });

		if (!err && methods) embed.addFields({ name: ':wrench: Methods', value: methods });
		if (!err && proto) embed.addFields({ name: ':gear:	Proto', value: proto });

		if (!silent || message.util.isSlashMessage(message)) {
			await message.util.reply({ content: null, embeds: [embed] });
		} else {
			const success = await message.author.send({ embeds: [embed] }).catch(() => false);
			if (!deleteMsg) await message.react(success ? emojis.successFull : emojis.errorFull).catch(() => {});
		}

		if (deleteMsg && 'deletable' in message && message.deletable) await message.delete().catch(() => {});
	}

	private transpile(code: string): string {
		const transpileOptions = {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ESNext,
			moduleResolution: ts.ModuleResolutionKind.NodeNext,
			lib: ['esnext'],
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
			resolveJsonModule: true
		};

		return transpile(code, transpileOptions);
	}

	private async codeblock(obj: any, language: CodeBlockLang, options: CodeBlockCustomOptions = {}) {
		if (options.prototype) obj = Object.getPrototypeOf(obj);
		if (options.methods) obj = getMethods(obj);

		options.depth ??= 1;
		options.getters ??= true;

		return this.client.utils.inspectCleanRedactCodeblock(obj, language, options);
	}
}

type CodeBlockOptions = BushInspectOptions & { inspectStrings?: boolean };
interface CodeBlockCustomOptions extends CodeBlockOptions {
	prototype?: boolean;
	methods?: boolean;
}
