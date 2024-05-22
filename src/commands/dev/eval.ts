import * as lib from '#lib';
import {
	ActivePunishment,
	BotCommand,
	Global as GlobalModel,
	Guild as GuildModel,
	Level as LevelModel,
	Logger,
	ModLog as ModLogModel,
	Shared as SharedModel,
	StickyRole as StickyRoleModel,
	assertAll,
	colors,
	emojis,
	getMethods,
	simplifyPath,
	type ArgType,
	type CodeBlockLang,
	type CommandMessage,
	type CustomInspectOptions,
	type SlashMessage
} from '#lib';
import canvas from '@napi-rs/canvas';
import { Snowflake as SapphireSnowflake } from '@sapphire/snowflake';
import discordJS, { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import url from 'node:url';
import { promisify } from 'node:util';
import vm from 'node:vm';
import * as sequelize from 'sequelize';
import ts from 'typescript';
const sh = promisify(exec),
	SnowflakeUtil = new SapphireSnowflake(1420070400000n),
	__dirname = path.dirname(url.fileURLToPath(import.meta.url)),
	require = createRequire(import.meta.url);

type EvalArgs = {
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
};

export default class EvalCommand extends BotCommand {
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
			skipSendCheck: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: EvalArgs) {
		if (!message.author.isOwner()) return await message.util.reply(`${emojis.error} Only my developers can run this command.`);
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply({ ephemeral: args.silent });

		if (!args.sudo && ['delete', 'destroy'].some((p) => args.code.includes(p))) {
			return await message.util.send(`${emojis.error} This eval was blocked by smooth brain protection™.`);
		}

		const isTypescript = args.typescript || args.code.includes('```ts');
		let rawCode = args.code.replace(/[“”]/g, '"').replace(/```*(?:js|ts)?/g, '');
		if (args.async) {
			if (rawCode.includes(';') && (!rawCode.endsWith(';') || rawCode.includes('\n') || rawCode.split(';').length > 2)) {
				rawCode = `(async () => {${rawCode}})()`;
			} else {
				rawCode = `(async () => { return ${rawCode} })()`;
			}
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

		// capture the current stack trace so it can be removed from the error message
		const tmp: { stack?: string } = {};
		Error.captureStackTrace(tmp);
		const originalTrace = tmp.stack!.replace('Error\n', '').split('\n');

		try {
			if (/^(9\s*?\+\s*?10)|(10\s*?\+\s*?9)$/.test(code[code.lang]!)) {
				rawResult = '21';
			} else {
				rawResult = await this.evaluate(message, args, code.js);
			}
		} catch (e) {
			err = true;
			rawResult = e;
		}

		const inputJS = await this.codeblock(code.js, 'js');
		const inputTS = code.lang === 'ts' ? await this.codeblock(code.ts, 'ts') : undefined;

		embed.setTimestamp();

		if (inputTS) embed.addFields({ name: ':inbox_tray: Input (typescript)', value: inputTS });
		embed.addFields({ name: `:inbox_tray: Input${inputTS ? ' (transpiled javascript)' : ''}`, value: inputJS });

		// remove from of path from stack trace and remove parts of the stack trace that occurred before the command is executed
		// since the line numbers are different once evaluate is called - exec is included in the stack trace
		if (err && typeof rawResult.stack === 'string') {
			const lines = (<string>rawResult.stack)
				.split('\n')
				.filter((l) => !originalTrace.includes(l))
				.map((l) => simplifyPath(l));

			rawResult.stack = lines.join('\n');
		}

		const output = await this.codeblock(rawResult, 'js', {
			depth: args.sel_depth ?? 0,
			showHidden: args.hidden,
			showProxy: true,
			inspectStrings: !args.no_inspect_strings,
			colors: false
		});

		embed
			.setTitle(`${emojis[err ? 'errorFull' : 'successFull']} ${err ? 'Uns' : 'S'}uccessfully Evaluated Expression`)
			.setColor(colors[err ? 'error' : 'success'])
			.addFields({
				name: `:outbox_tray: ${err ? 'Error' : 'Output'}`,
				value: output
			});

		if (!err) {
			if (args.show_methods) {
				const methods = await this.codeblock(rawResult, 'ts', { methods: true });

				embed.addFields({ name: ':wrench: Methods', value: methods });
			}

			if (args.show_proto) {
				const proto = await this.codeblock(rawResult, 'js', { showHidden: true, prototype: true });

				embed.addFields({ name: ':gear:	Proto', value: proto });
			}
		}

		if (!args.silent || message.util.isSlashMessage(message)) {
			await message.util.reply({ content: '', embeds: [embed] });
		} else {
			const success = await message.author.send({ embeds: [embed] }).catch(() => false);
			if (!args.delete_msg) await message.react(success ? emojis.successFull : emojis.errorFull).catch(() => {});
		}

		if (!message.util.isSlashMessage(message) && args.delete_msg && message.deletable) await message.delete().catch(() => {});
	}

	private async evaluate(message: CommandMessage | SlashMessage, args: EvalArgs, code: string) {
		const ctx = vm.createContext({
			...discordJS,
			message,
			args,
			assert,
			assertAll,
			ActivePunishment,
			GlobalModel,
			GuildModel,
			LevelModel,
			ModLogModel,
			SharedModel,
			StickyRoleModel,
			colors,
			emojis,
			getMethods,
			canvas,
			vm,
			ts,
			path,
			url,
			sh,
			Logger,
			sequelize,
			lib,
			process,
			promisify,
			require,
			__dirname,
			SnowflakeUtil,
			self: this,
			me: message.member,
			member: message.member,
			bot: this.client,
			client: this.client,
			guild: message.guild,
			channel: message.channel,
			config: this.client.config,
			members: message.guild?.members,
			roles: message.guild?.roles
		});

		const script = new vm.Script(code, {
			filename: 'eval',
			importModuleDynamically(specifier, _, importAssertions) {
				// the types don't align properly
				return <any>(importAssertions ? import(specifier, <any>importAssertions) : import(specifier));
			}
		});

		return await script.runInContext(ctx);
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

		return ts.transpile(code, transpileOptions);
	}

	private async codeblock(obj: any, language: CodeBlockLang, options: CodeBlockCustomOptions = {}) {
		if (options.prototype) obj = Object.getPrototypeOf(obj);
		if (options.methods) obj = getMethods(obj);

		options.depth ??= 1;
		options.getters ??= true;

		return this.client.utils.inspectCleanRedactCodeblock(obj, language, options);
	}
}

type CodeBlockOptions = CustomInspectOptions & { inspectStrings?: boolean };
interface CodeBlockCustomOptions extends CodeBlockOptions {
	prototype?: boolean;
	methods?: boolean;
}
