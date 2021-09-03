import {
	BushArgumentType,
	BushCache,
	BushClient,
	BushConstants,
	BushGuildMember,
	BushGuildMemberResolvable,
	BushGuildResolvable,
	BushMessage,
	BushSlashMessage,
	Global,
	Guild,
	ModLog,
	ModLogType,
	Pronoun,
	PronounCode
} from '@lib';
import { exec } from 'child_process';
import {
	Argument,
	ArgumentTypeCaster,
	ClientUtil,
	Flag,
	ParsedValuePredicate,
	TypeResolver,
	Util as AkairoUtil
} from 'discord-akairo';
import { APIMessage } from 'discord-api-types';
import {
	ColorResolvable,
	CommandInteraction,
	Constants,
	GuildMember,
	Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEditOptions,
	MessageEmbed,
	MessageEmbedOptions,
	MessageOptions,
	Snowflake,
	TextChannel,
	ThreadMember,
	User,
	UserResolvable,
	Util as DiscordUtil
} from 'discord.js';
import got from 'got';
import humanizeDuration from 'humanize-duration';
import _ from 'lodash';
import moment from 'moment';
import fetch from 'node-fetch';
import { inspect, InspectOptions, promisify } from 'util';
import CommandErrorListener from '../../../listeners/commands/commandError';
import { ActivePunishment, ActivePunishmentType } from '../../models/ActivePunishment';
import { BushNewsChannel } from '../discord.js/BushNewsChannel';
import { BushTextChannel } from '../discord.js/BushTextChannel';
import { BushSlashEditMessageType, BushSlashSendMessageType, BushUserResolvable } from './BushClient';

interface hastebinRes {
	key: string;
}

export interface uuidRes {
	uuid: string;
	username: string;
	username_history?: { username: string }[] | null;
	textures: {
		custom: boolean;
		slim: boolean;
		skin: {
			url: string;
			data: string;
		};
		raw: {
			value: string;
			signature: string;
		};
	};
	created_at: string;
}

interface MojangProfile {
	username: string;
	uuid: string;
}

// #region codeblock type
export type CodeBlockLang =
	| '1c'
	| 'abnf'
	| 'accesslog'
	| 'actionscript'
	| 'ada'
	| 'arduino'
	| 'ino'
	| 'armasm'
	| 'arm'
	| 'avrasm'
	| 'actionscript'
	| 'as'
	| 'angelscript'
	| 'asc'
	| 'apache'
	| 'apacheconf'
	| 'applescript'
	| 'osascript'
	| 'arcade'
	| 'asciidoc'
	| 'adoc'
	| 'aspectj'
	| 'autohotkey'
	| 'autoit'
	| 'awk'
	| 'mawk'
	| 'nawk'
	| 'gawk'
	| 'bash'
	| 'sh'
	| 'zsh'
	| 'basic'
	| 'bnf'
	| 'brainfuck'
	| 'bf'
	| 'csharp'
	| 'cs'
	| 'c'
	| 'h'
	| 'cpp'
	| 'hpp'
	| 'cc'
	| 'hh'
	| 'c++'
	| 'h++'
	| 'cxx'
	| 'hxx'
	| 'cal'
	| 'cos'
	| 'cls'
	| 'cmake'
	| 'cmake.in'
	| 'coq'
	| 'csp'
	| 'css'
	| 'capnproto'
	| 'capnp'
	| 'clojure'
	| 'clj'
	| 'coffeescript'
	| 'coffee'
	| 'cson'
	| 'iced'
	| 'crmsh'
	| 'crm'
	| 'pcmk'
	| 'crystal'
	| 'cr'
	| 'd'
	| 'dns'
	| 'zone'
	| 'bind'
	| 'dos'
	| 'bat'
	| 'cmd'
	| 'dart'
	| 'dpr'
	| 'dfm'
	| 'pas'
	| 'pascal'
	| 'diff'
	| 'patch'
	| 'django'
	| 'jinja'
	| 'dockerfile'
	| 'docker'
	| 'dsconfig'
	| 'dts'
	| 'dust'
	| 'dst'
	| 'ebnf'
	| 'elixir'
	| 'elm'
	| 'erlang'
	| 'erl'
	| 'excel'
	| 'xls'
	| 'xlsx'
	| 'fsharp'
	| 'fs'
	| 'fix'
	| 'fortran'
	| 'f90'
	| 'f95'
	| 'gcode'
	| 'nc'
	| 'gams'
	| 'gms'
	| 'gauss'
	| 'gss'
	| 'gherkin'
	| 'go'
	| 'golang'
	| 'golo'
	| 'gololang'
	| 'gradle'
	| 'groovy'
	| 'xml'
	| 'html'
	| 'xhtml'
	| 'rss'
	| 'atom'
	| 'xjb'
	| 'xsd'
	| 'xsl'
	| 'plist'
	| 'svg'
	| 'http'
	| 'https'
	| 'haml'
	| 'handlebars'
	| 'hbs'
	| 'html.hbs'
	| 'html.handlebars'
	| 'haskell'
	| 'hs'
	| 'haxe'
	| 'hx'
	| 'hlsl'
	| 'hy'
	| 'hylang'
	| 'ini'
	| 'toml'
	| 'inform7'
	| 'i7'
	| 'irpf90'
	| 'json'
	| 'java'
	| 'jsp'
	| 'javascript'
	| 'js'
	| 'jsx'
	| 'julia'
	| 'julia-repl'
	| 'kotlin'
	| 'kt'
	| 'tex'
	| 'leaf'
	| 'lasso'
	| 'ls'
	| 'lassoscript'
	| 'less'
	| 'ldif'
	| 'lisp'
	| 'livecodeserver'
	| 'livescript'
	| 'ls'
	| 'lua'
	| 'makefile'
	| 'mk'
	| 'mak'
	| 'make'
	| 'markdown'
	| 'md'
	| 'mkdown'
	| 'mkd'
	| 'mathematica'
	| 'mma'
	| 'wl'
	| 'matlab'
	| 'maxima'
	| 'mel'
	| 'mercury'
	| 'mizar'
	| 'mojolicious'
	| 'monkey'
	| 'moonscript'
	| 'moon'
	| 'n1ql'
	| 'nsis'
	| 'nginx'
	| 'nginxconf'
	| 'nim'
	| 'nimrod'
	| 'nix'
	| 'ocaml'
	| 'ml'
	| 'objectivec'
	| 'mm'
	| 'objc'
	| 'obj-c'
	| 'obj-c++'
	| 'objective-c++'
	| 'glsl'
	| 'openscad'
	| 'scad'
	| 'ruleslanguage'
	| 'oxygene'
	| 'pf'
	| 'pf.conf'
	| 'php'
	| 'parser3'
	| 'perl'
	| 'pl'
	| 'pm'
	| 'plaintext'
	| 'txt'
	| 'text'
	| 'pony'
	| 'pgsql'
	| 'postgres'
	| 'postgresql'
	| 'powershell'
	| 'ps'
	| 'ps1'
	| 'processing'
	| 'prolog'
	| 'properties'
	| 'protobuf'
	| 'puppet'
	| 'pp'
	| 'python'
	| 'py'
	| 'gyp'
	| 'profile'
	| 'python-repl'
	| 'pycon'
	| 'k'
	| 'kdb'
	| 'qml'
	| 'r'
	| 'reasonml'
	| 're'
	| 'rib'
	| 'rsl'
	| 'graph'
	| 'instances'
	| 'ruby'
	| 'rb'
	| 'gemspec'
	| 'podspec'
	| 'thor'
	| 'irb'
	| 'rust'
	| 'rs'
	| 'sas'
	| 'scss'
	| 'sql'
	| 'p21'
	| 'step'
	| 'stp'
	| 'scala'
	| 'scheme'
	| 'scilab'
	| 'sci'
	| 'shell'
	| 'console'
	| 'smali'
	| 'smalltalk'
	| 'st'
	| 'sml'
	| 'ml'
	| 'stan'
	| 'stanfuncs'
	| 'stata'
	| 'stylus'
	| 'styl'
	| 'subunit'
	| 'swift'
	| 'tcl'
	| 'tk'
	| 'tap'
	| 'thrift'
	| 'tp'
	| 'twig'
	| 'craftcms'
	| 'typescript'
	| 'ts'
	| 'vbnet'
	| 'vb'
	| 'vbscript'
	| 'vbs'
	| 'vhdl'
	| 'vala'
	| 'verilog'
	| 'v'
	| 'vim'
	| 'axapta'
	| 'x++'
	| 'x86asm'
	| 'xl'
	| 'tao'
	| 'xquery'
	| 'xpath'
	| 'xq'
	| 'yml'
	| 'yaml'
	| 'zephir'
	| 'zep';
//#endregion

/**
 * {@link https://nodejs.org/api/util.html#util_util_inspect_object_options}
 */
export interface BushInspectOptions extends InspectOptions {
	/**
	 * If `true`, object's non-enumerable symbols and properties are included in the
	 * formatted result. [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) and [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries are also included as well as
	 * user defined prototype properties (excluding method properties).
	 *
	 * **Default**: `false`.
	 */
	showHidden?: boolean | undefined;
	/**
	 * Specifies the number of times to recurse while formatting `object`. This is useful
	 * for inspecting large objects. To recurse up to the maximum call stack size pass
	 * `Infinity` or `null`.
	 *
	 * **Default**: `2`.
	 */
	depth?: number | null | undefined;
	/**
	 * If `true`, the output is styled with ANSI color codes. Colors are customizable. See [Customizing util.inspect colors](https://nodejs.org/api/util.html#util_customizing_util_inspect_colors).
	 *
	 * **Default**: `false`.
	 */
	colors?: boolean | undefined;
	/**
	 * If `false`, `[util.inspect.custom](depth, opts)` functions are not invoked.
	 *
	 * **Default**: `true`.
	 */
	customInspect?: boolean | undefined;
	/**
	 * If `true`, `Proxy` inspection includes the [`target` and `handler`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Terminology) objects.
	 *
	 * **Default**: `false`.
	 */
	showProxy?: boolean | undefined;
	/**
	 * Specifies the maximum number of `Array`, [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) and
	 * [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) elements to include when formatting. Set to `null` or `Infinity` to
	 * show all elements. Set to `0` or negative to show no elements.
	 *
	 * **Default**: `100`.
	 */
	maxArrayLength?: number | null | undefined;
	/**
	 * Specifies the maximum number of characters to include when formatting. Set to
	 * `null` or `Infinity` to show all elements. Set to `0` or negative to show no
	 * characters.
	 *
	 * **Default**: `10000`.
	 */
	maxStringLength?: number | null | undefined;
	/**
	 * The length at which input values are split across multiple lines. Set to
	 * `Infinity` to format the input as a single line (in combination with compact set
	 * to `true` or any number >= `1`).
	 *
	 * **Default**: `80`.
	 */
	breakLength?: number | undefined;
	/**
	 * Setting this to `false` causes each object key to be displayed on a new line. It
	 * will break on new lines in text that is longer than `breakLength`. If set to a
	 * number, the most `n` inner elements are united on a single line as long as all
	 * properties fit into `breakLength`. Short array elements are also grouped together.
	 *
	 * **Default**: `3`
	 */
	compact?: boolean | number | undefined;
	/**
	 * If set to `true` or a function, all properties of an object, and `Set` and `Map`
	 * entries are sorted in the resulting string. If set to `true` the [default sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) is used.
	 * If set to a function, it is used as a [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters).
	 *
	 * **Default**: `false`.
	 */
	sorted?: boolean | ((a: string, b: string) => number) | undefined;
	/**
	 * If set to `true`, getters are inspected. If set to `'get'`, only getters without a
	 * corresponding setter are inspected. If set to `'set'`, only getters with a
	 * corresponding setter are inspected. This might cause side effects depending on
	 * the getter function.
	 *
	 * **Default**: `false`.
	 */
	getters?: 'get' | 'set' | boolean | undefined;
}

export class BushClientUtil extends ClientUtil {
	/**
	 * The client.
	 */
	public declare readonly client: BushClient;

	/**
	 * The hastebin urls used to post to hastebin, attempts to post in order
	 */
	#hasteURLs: string[] = [
		'https://hst.sh',
		'https://hasteb.in',
		'https://hastebin.com',
		'https://mystb.in',
		'https://haste.clicksminuteper.net',
		'https://paste.pythondiscord.com',
		'https://haste.unbelievaboat.com',
		'https://haste.tyman.tech'
	];

	/**
	 * Emojis used for {@link BushClientUtil.buttonPaginate}
	 */
	#paginateEmojis = {
		beginning: '853667381335162910',
		back: '853667410203770881',
		stop: '853667471110570034',
		forward: '853667492680564747',
		end: '853667514915225640'
	};

	/**
	 * A simple promise exec method
	 */
	#exec = promisify(exec);

	/**
	 * Creates this client util
	 * @param client The client to initialize with
	 */
	public constructor(client: BushClient) {
		super(client);
	}

	/**
	 * Maps an array of user ids to user objects.
	 * @param ids The list of IDs to map
	 * @returns The list of users mapped
	 */
	public async mapIDs(ids: Snowflake[]): Promise<User[]> {
		return await Promise.all(ids.map((id) => client.users.fetch(id)));
	}

	/**
	 * Capitalizes the first letter of the given text
	 * @param text The text to capitalize
	 * @returns The capitalized text
	 */
	public capitalize(text: string): string {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	/**
	 * Runs a shell command and gives the output
	 * @param command The shell command to run
	 * @returns The stdout and stderr of the shell command
	 */
	public async shell(command: string): Promise<{
		stdout: string;
		stderr: string;
	}> {
		return await this.#exec(command);
	}

	/**
	 * Posts text to hastebin
	 * @param content The text to post
	 * @returns The url of the posted text
	 */
	public async haste(content: string): Promise<string> {
		for (const url of this.#hasteURLs) {
			try {
				const res: hastebinRes = await got.post(`${url}/documents`, { body: content }).json();
				return `${url}/${res.key}`;
			} catch {
				void client.console.error('haste', `Unable to upload haste to ${url}`);
			}
		}
		return 'Unable to post';
	}

	/**
	 * Resolves a user-provided string into a user object, if possible
	 * @param text The text to try and resolve
	 * @returns The user resolved or null
	 */
	public async resolveUserAsync(text: string): Promise<User | null> {
		const idReg = /\d{17,19}/;
		const idMatch = text.match(idReg);
		if (idMatch) {
			try {
				return await client.users.fetch(text as Snowflake);
			} catch {
				// pass
			}
		}
		const mentionReg = /<@!?(?<id>\d{17,19})>/;
		const mentionMatch = text.match(mentionReg);
		if (mentionMatch) {
			try {
				return await client.users.fetch(mentionMatch.groups!.id as Snowflake);
			} catch {
				// pass
			}
		}
		const user = client.users.cache.find((u) => u.username === text);
		if (user) return user;
		return null;
	}

	/**
	 * Appends the correct ordinal to the given number
	 * @param n The number to append an ordinal to
	 * @returns The number with the ordinal
	 */
	public ordinal(n: number): string {
		const s = ['th', 'st', 'nd', 'rd'],
			v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}

	/**
	 * Chunks an array to the specified size
	 * @param arr The array to chunk
	 * @param perChunk The amount of items per chunk
	 * @returns The chunked array
	 */
	public chunk<T>(arr: T[], perChunk: number): T[][] {
		return arr.reduce((all, one, i) => {
			const ch: number = Math.floor(i / perChunk);
			(all as any[])[ch] = [].concat(all[ch] || [], one as any);
			return all;
		}, []);
	}

	/**
	 * Commonly Used Colors
	 */
	get colors() {
		return client.consts.colors;
	}

	/**
	 * Commonly Used Emojis
	 */
	get emojis() {
		return client.consts.emojis;
	}

	/**
	 * A simple utility to create and embed with the needed style for the bot
	 */
	public createEmbed(color?: ColorResolvable, author?: User | GuildMember): MessageEmbed {
		if (author instanceof GuildMember) {
			author = author.user; // Convert to User if GuildMember
		}
		let embed = new MessageEmbed().setTimestamp();
		if (author)
			embed = embed.setAuthor(
				author.username,
				author.displayAvatarURL({ dynamic: true }),
				`https://discord.com/users/${author.id}`
			);
		if (color) embed = embed.setColor(color);
		return embed;
	}

	public async mcUUID(username: string): Promise<string> {
		const apiRes = (await got.get(`https://api.ashcon.app/mojang/v2/user/${username}`).json()) as uuidRes;
		return apiRes.uuid.replace(/-/g, '');
	}

	/**
	 * Paginates an array of embeds using buttons.
	 */
	public async buttonPaginate(
		message: BushMessage | BushSlashMessage,
		embeds: MessageEmbed[] | MessageEmbedOptions[],
		text: string | null = null,
		deleteOnExit?: boolean,
		startOn?: number
	): Promise<void> {
		const paginateEmojis = this.#paginateEmojis;
		if (deleteOnExit === undefined) deleteOnExit = true;

		if (embeds.length === 1) {
			return this.sendWithDeleteButton(message, { embeds: embeds });
		}

		embeds.forEach((_e, i) => {
			embeds[i] instanceof MessageEmbed
				? (embeds[i] as MessageEmbed).setFooter(`Page ${(i + 1).toLocaleString()}/${embeds.length.toLocaleString()}`)
				: ((embeds[i] as MessageEmbedOptions).footer = {
						text: `Page ${(i + 1).toLocaleString()}/${embeds.length.toLocaleString()}`
				  });
		});

		const style = Constants.MessageButtonStyles.PRIMARY;
		let curPage = startOn ? startOn - 1 : 0;
		if (typeof embeds !== 'object') throw new Error('embeds must be an object');
		const msg = (await message.util.reply({
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			content: text || null,
			embeds: [embeds[curPage]],
			components: [getPaginationRow()]
		})) as Message;
		const filter = (interaction: MessageComponentInteraction) =>
			interaction.customId.startsWith('paginate_') && interaction.message.id === msg.id;
		const collector = msg.createMessageComponentCollector({ filter, time: 300000 });
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id === message.author.id || client.config.owners.includes(interaction.user.id)) {
				switch (interaction.customId) {
					case 'paginate_beginning': {
						curPage = 0;
						await edit(interaction);
						break;
					}
					case 'paginate_back': {
						curPage--;
						await edit(interaction);
						break;
					}
					case 'paginate_stop': {
						if (deleteOnExit) {
							await interaction.deferUpdate().catch(() => undefined);
							if (msg.deletable && !msg.deleted) {
								await msg.delete();
							}
						} else {
							await interaction
								?.update({
									content: `${text ? `${text}\n` : ''}Command closed by user.`,
									embeds: [],
									components: []
								})
								.catch(() => undefined);
						}
						return;
					}
					case 'paginate_next': {
						curPage++;
						await edit(interaction);
						break;
					}
					case 'paginate_end': {
						curPage = embeds.length - 1;
						await edit(interaction);
						break;
					}
				}
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});

		collector.on('end', async () => {
			await msg
				.edit({
					content: text,
					embeds: [embeds[curPage]],
					components: [getPaginationRow(true)]
				})
				.catch(() => undefined);
		});

		async function edit(interaction: MessageComponentInteraction): Promise<void> {
			return await interaction
				?.update({ content: text, embeds: [embeds[curPage]], components: [getPaginationRow()] })
				.catch(() => undefined);
		}
		function getPaginationRow(disableAll = false): MessageActionRow {
			return new MessageActionRow().addComponents(
				new MessageButton({
					style,
					customId: 'paginate_beginning',
					emoji: paginateEmojis.beginning,
					disabled: disableAll || curPage === 0
				}),
				new MessageButton({
					style,
					customId: 'paginate_back',
					emoji: paginateEmojis.back,
					disabled: disableAll || curPage === 0
				}),
				new MessageButton({
					style,
					customId: 'paginate_stop',
					emoji: paginateEmojis.stop,
					disabled: disableAll
				}),
				new MessageButton({
					style,
					customId: 'paginate_next',
					emoji: paginateEmojis.forward,
					disabled: disableAll || curPage === embeds.length - 1
				}),
				new MessageButton({
					style,
					customId: 'paginate_end',
					emoji: paginateEmojis.end,
					disabled: disableAll || curPage === embeds.length - 1
				})
			);
		}
	}

	/**
	 * Sends a message with a button for the user to delete it.
	 */
	public async sendWithDeleteButton(message: BushMessage | BushSlashMessage, options: MessageOptions): Promise<void> {
		const paginateEmojis = this.#paginateEmojis;
		updateOptions();
		const msg = (await message.util.reply(options as MessageOptions & { split?: false })) as Message;
		const filter = (interaction: MessageComponentInteraction) =>
			interaction.customId == 'paginate__stop' && interaction.message == msg;
		const collector = msg.createMessageComponentCollector({ filter, time: 300000 });
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id == message.author.id || client.config.owners.includes(interaction.user.id)) {
				await interaction.deferUpdate().catch(() => undefined);
				if (msg.deletable && !msg.deleted) {
					await msg.delete();
				}
				return;
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});

		collector.on('end', async () => {
			updateOptions(true, true);
			await msg.edit(options as MessageEditOptions).catch(() => undefined);
		});

		function updateOptions(edit?: boolean, disable?: boolean) {
			if (edit == undefined) edit = false;
			if (disable == undefined) disable = false;
			options.components = [
				new MessageActionRow().addComponents(
					new MessageButton({
						style: Constants.MessageButtonStyles.PRIMARY,
						customId: 'paginate__stop',
						emoji: paginateEmojis.stop,
						disabled: disable
					})
				)
			];
			if (edit) {
				options.reply = undefined;
			}
		}
	}

	/**
	 * Surrounds text in a code block with the specified language and puts it in a hastebin if its too long.
	 * * Embed Description Limit = 4096 characters
	 * * Embed Field Limit = 1024 characters
	 */
	public async codeblock(code: string, length: number, language?: CodeBlockLang): Promise<string> {
		let hasteOut = '';
		const prefix = `\`\`\`${language}\n`;
		const suffix = '\n```';
		language = language ?? 'txt';
		if (code.length + (prefix + suffix).length >= length)
			hasteOut = `Too large to display. Hastebin: ${await this.haste(code)}`;

		const FormattedHaste = hasteOut.length ? `\n${hasteOut}` : '';
		const shortenedCode = hasteOut ? code.substring(0, length - (prefix + FormattedHaste + suffix).length) : code;
		const code3 = code.length ? prefix + shortenedCode + suffix + FormattedHaste : prefix + suffix;
		if (code3.length > length) {
			void client.console.warn(`codeblockError`, `Required Length: ${length}. Actual Length: ${code3.length}`, true);
			void client.console.warn(`codeblockError`, code3, true);
			throw new Error('code too long');
		}
		return code3;
	}

	public inspect(code: any, options?: BushInspectOptions): string {
		const {
			showHidden: _showHidden = false,
			depth: _depth = 2,
			colors: _colors = false,
			customInspect: _customInspect = true,
			showProxy: _showProxy = false,
			maxArrayLength: _maxArrayLength = Infinity,
			maxStringLength: _maxStringLength = Infinity,
			breakLength: _breakLength = 80,
			compact: _compact = 3,
			sorted: _sorted = false,
			getters: _getters = true
		} = options ?? {};
		const optionsWithDefaults: BushInspectOptions = {
			showHidden: _showHidden,
			depth: _depth,
			colors: _colors,
			customInspect: _customInspect,
			showProxy: _showProxy,
			maxArrayLength: _maxArrayLength,
			maxStringLength: _maxStringLength,
			breakLength: _breakLength,
			compact: _compact,
			sorted: _sorted,
			getters: _getters
		};
		return inspect(code, optionsWithDefaults);
	}

	#mapCredential(old: string): string {
		const mapping = {
			['token']: 'Main Token',
			['devToken']: 'Dev Token',
			['betaToken']: 'Beta Token',
			['hypixelApiKey']: 'Hypixel Api Key',
			['wolframAlphaAppId']: 'Wolfram|Alpha App ID'
		};
		return mapping[old as keyof typeof mapping] || old;
	}

	/**
	 * Redacts credentials from a string
	 */
	public redact(text: string) {
		for (const credentialName in client.config.credentials) {
			const credential = client.config.credentials[credentialName as keyof typeof client.config.credentials];
			const replacement = this.#mapCredential(credentialName);
			const escapeRegex = /[.*+?^${}()|[\]\\]/g;
			text = text.replace(new RegExp(credential.toString().replace(escapeRegex, '\\$&'), 'g'), `[${replacement} Omitted]`);
			text = text.replace(
				new RegExp([...credential.toString()].reverse().join('').replace(escapeRegex, '\\$&'), 'g'),
				`[${replacement} Omitted]`
			);
		}
		return text;
	}

	/**
	 * Takes an any value, inspects it, redacts credentials and puts it in a codeblock
	 * (and uploads to hast if the content is too long)
	 */
	public async inspectCleanRedactCodeblock(
		input: any,
		language?: CodeBlockLang,
		inspectOptions?: BushInspectOptions,
		length = 1024
	) {
		input = typeof input !== 'string' ? this.inspect(input, inspectOptions ?? undefined) : input;
		input = this.discord.cleanCodeBlockContent(input);
		input = this.redact(input);
		return this.codeblock(input, length, language);
	}

	public async inspectCleanRedactHaste(input: any, inspectOptions?: BushInspectOptions) {
		input = typeof input !== 'string' ? this.inspect(input, inspectOptions ?? undefined) : input;
		input = this.redact(input);
		return this.haste(input);
	}

	public inspectAndRedact(input: any, inspectOptions?: BushInspectOptions) {
		input = typeof input !== 'string' ? this.inspect(input, inspectOptions ?? undefined) : input;
		return this.redact(input);
	}

	public async slashRespond(
		interaction: CommandInteraction,
		responseOptions: BushSlashSendMessageType | BushSlashEditMessageType
	): Promise<Message | APIMessage | undefined> {
		let newResponseOptions: BushSlashSendMessageType | BushSlashEditMessageType = {};
		if (typeof responseOptions === 'string') {
			newResponseOptions.content = responseOptions;
		} else {
			newResponseOptions = responseOptions;
		}
		if (interaction.replied || interaction.deferred) {
			// @ts-expect-error: stop being dumb
			delete newResponseOptions.ephemeral; // Cannot change a preexisting message to be ephemeral
			return (await interaction.editReply(newResponseOptions)) as Message | APIMessage;
		} else {
			await interaction.reply(newResponseOptions);
			return await interaction.fetchReply().catch(() => undefined);
		}
	}

	/**
	 * Gets a a configured channel as a TextChannel
	 */
	public async getConfigChannel(channel: keyof typeof client['config']['channels']): Promise<TextChannel> {
		return (await client.channels.fetch(client.config.channels[channel])) as unknown as TextChannel;
	}

	/**
	 * Takes an array and combines the elements using the supplied conjunction.
	 * @param array The array to combine.
	 * @param conjunction The conjunction to use.
	 * @param ifEmpty What to return if the array is empty.
	 * @returns The combined elements or `ifEmpty`
	 *
	 * @example
	 * const permissions = oxford(['ADMINISTRATOR', 'SEND_MESSAGES', 'MANAGE_MESSAGES'], 'and', 'none');
	 * console.log(permissions); // ADMINISTRATOR, SEND_MESSAGES and MANAGE_MESSAGES
	 */
	public oxford(array: string[], conjunction: string, ifEmpty?: string): string | undefined {
		const l = array.length;
		if (!l) return ifEmpty;
		if (l < 2) return array[0];
		if (l < 3) return array.join(` ${conjunction} `);
		array = array.slice();
		array[l - 1] = `${conjunction} ${array[l - 1]}`;
		return array.join(', ');
	}

	public async insertOrRemoveFromGlobal(
		action: 'add' | 'remove',
		key: keyof typeof BushCache['global'],
		value: any
	): Promise<Global | void> {
		const row =
			(await Global.findByPk(client.config.environment)) ?? (await Global.create({ environment: client.config.environment }));
		const oldValue: any[] = row[key];
		const newValue = this.addOrRemoveFromArray(action, oldValue, value);
		row[key] = newValue;
		client.cache.global[key] = newValue;
		return await row.save().catch((e) => util.handleError('insertOrRemoveFromGlobal', e));
	}

	/**
	 * Add or remove an item from an array. All duplicates will be removed.
	 */
	public addOrRemoveFromArray<T extends any>(action: 'add' | 'remove', array: T[], value: T): T[] {
		const set = new Set(array);
		action === 'add' ? set.add(value) : set.delete(value);
		return [...set];
	}

	/**
	 * Surrounds a string to the begging an end of each element in an array.
	 * @param array - The array you want to surround.
	 * @param surroundChar1 - The character placed in the beginning of the element.
	 * @param surroundChar2 - The character placed in the end of the element. Defaults to `surroundChar1`.
	 */
	public surroundArray(array: string[], surroundChar1: string, surroundChar2?: string): string[] {
		return array.map((a) => `${surroundChar1}${a}${surroundChar2 ?? surroundChar1}`);
	}

	public parseDuration(content: string, remove = true): { duration: number; contentWithoutTime: string | null } {
		if (!content) return { duration: 0, contentWithoutTime: null };

		let duration = 0;
		// Try to reduce false positives by requiring a space before the duration, this makes sure it still matches if it is
		// in the beginning of the argument
		let contentWithoutTime = ` ${content}`;

		for (const unit in BushConstants.TimeUnits) {
			const regex = BushConstants.TimeUnits[unit].match;
			const match = regex.exec(contentWithoutTime);
			const value = Number(match?.groups?.[unit] ?? 0);
			duration += value * BushConstants.TimeUnits[unit].value;

			if (remove) contentWithoutTime = contentWithoutTime.replace(regex, '');
		}
		// remove the space added earlier
		if (contentWithoutTime.startsWith(' ')) contentWithoutTime.replace(' ', '');
		return { duration, contentWithoutTime };
	}

	/**
	 * Checks if a moderator can perform a moderation action on another user.
	 * @param moderator - The person trying to perform the action.
	 * @param victim - The person getting punished.
	 * @param type - The type of punishment - used to format the response.
	 * @param checkModerator - Whether or not to check if the victim is a moderator.
	 */
	public async moderationPermissionCheck(
		moderator: BushGuildMember,
		victim: BushGuildMember,
		type: 'mute' | 'unmute' | 'warn' | 'kick' | 'ban' | 'unban' | 'add a punishment role to' | 'remove a punishment role from',
		checkModerator = true,
		force = false
	): Promise<true | string> {
		if (force) return true;

		// If the victim is not in the guild anymore it will be undefined
		if (!victim.guild && ['ban', 'unban'].includes(type)) return true;

		if (moderator.guild.id !== victim.guild.id) {
			throw new Error('moderator and victim not in same guild');
		}

		const isOwner = moderator.guild.ownerId === moderator.id;
		if (moderator.id === victim.id && !type.startsWith('un')) {
			return `${util.emojis.error} You cannot ${type} yourself.`;
		}
		if (
			moderator.roles.highest.position <= victim.roles.highest.position &&
			!isOwner &&
			!(type.startsWith('un') && moderator.id === victim.id)
		) {
			return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they have higher or equal role hierarchy as you do.`;
		}
		if (
			victim.roles.highest.position >= victim.guild.me!.roles.highest.position &&
			!(type.startsWith('un') && moderator.id === victim.id)
		) {
			return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they have higher or equal role hierarchy as I do.`;
		}
		if (checkModerator && victim.permissions.has('MANAGE_MESSAGES') && !(type.startsWith('un') && moderator.id === victim.id)) {
			if (await moderator.guild.hasFeature('modsCanPunishMods')) {
				return true;
			} else {
				return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they are a moderator.`;
			}
		}
		return true;
	}

	public async createModLogEntry(
		options: {
			type: ModLogType;
			user: BushGuildMemberResolvable;
			moderator: BushGuildMemberResolvable;
			reason: string | undefined | null;
			duration?: number;
			guild: BushGuildResolvable;
		},
		getCaseNumber = false
	): Promise<{ log: ModLog | null; caseNum: number | null }> {
		const user = (await util.resolveNonCachedUser(options.user))!.id;
		const moderator = (await util.resolveNonCachedUser(options.moderator))!.id;
		const guild = client.guilds.resolveId(options.guild)!;
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const duration = options.duration || undefined;

		// If guild does not exist create it so the modlog can reference a guild.
		await Guild.findOrCreate({
			where: {
				id: guild
			},
			defaults: {
				id: guild
			}
		});

		const modLogEntry = ModLog.build({
			type: options.type,
			user,
			moderator,
			reason: options.reason,
			duration: duration,
			guild
		});
		const saveResult: ModLog | null = await modLogEntry.save().catch(async (e) => {
			await util.handleError('createModLogEntry', e);
			return null;
		});

		if (!getCaseNumber) return { log: saveResult, caseNum: null };

		const caseNum = (await ModLog.findAll({ where: { type: options.type, user: user, guild: guild } }))?.length;
		return { log: saveResult, caseNum };
	}

	public async createPunishmentEntry(options: {
		type: 'mute' | 'ban' | 'role' | 'block';
		user: BushGuildMemberResolvable;
		duration: number | undefined;
		guild: BushGuildResolvable;
		modlog?: string;
		extraInfo?: Snowflake;
	}): Promise<ActivePunishment | null> {
		const expires = options.duration ? new Date(new Date().getTime() + options.duration ?? 0) : undefined;
		client.console.debug(expires, 1);
		client.console.debug(typeof expires);
		const user = (await util.resolveNonCachedUser(options.user))!.id;
		const guild = client.guilds.resolveId(options.guild)!;
		const type = this.#findTypeEnum(options.type)!;

		const entry = options.extraInfo
			? ActivePunishment.build({ user, type, guild, expires, modlog: options.modlog, extraInfo: options.extraInfo })
			: ActivePunishment.build({ user, type, guild, expires, modlog: options.modlog });
		return await entry.save().catch(async (e) => {
			await util.handleError('createPunishmentEntry', e);
			return null;
		});
	}

	public async removePunishmentEntry(options: {
		type: 'mute' | 'ban' | 'role' | 'block';
		user: BushGuildMemberResolvable;
		guild: BushGuildResolvable;
	}): Promise<boolean> {
		const user = await util.resolveNonCachedUser(options.user);
		const guild = client.guilds.resolveId(options.guild);
		const type = this.#findTypeEnum(options.type);

		if (!user || !guild) return false;

		let success = true;

		const entries = await ActivePunishment.findAll({
			// finding all cases of a certain type incase there were duplicates or something
			where: { user: user.id, guild: guild, type }
		}).catch(async (e) => {
			await util.handleError('removePunishmentEntry', e);
			success = false;
		});
		if (entries) {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			entries.forEach(async (entry) => {
				await entry.destroy().catch(async (e) => {
					await util.handleError('removePunishmentEntry', e);
				});
				success = false;
			});
		}
		return success;
	}

	#findTypeEnum(type: 'mute' | 'ban' | 'role' | 'block') {
		const typeMap = {
			['mute']: ActivePunishmentType.MUTE,
			['ban']: ActivePunishmentType.BAN,
			['role']: ActivePunishmentType.ROLE,
			['block']: ActivePunishmentType.BLOCK
		};
		return typeMap[type];
	}

	public humanizeDuration(duration: number, largest?: number): string {
		if (largest) return humanizeDuration(duration, { language: 'en', maxDecimalPoints: 2, largest });
		else return humanizeDuration(duration, { language: 'en', maxDecimalPoints: 2 });
	}

	public dateDelta(date: Date, largest?: number) {
		return this.humanizeDuration(moment(date).diff(moment()), largest ?? 3);
	}

	public async findUUID(player: string): Promise<string> {
		try {
			const raw = await got.get(`https://api.ashcon.app/mojang/v2/user/${player}`);
			let profile: MojangProfile;
			if (raw.statusCode == 200) {
				profile = JSON.parse(raw.body);
			} else {
				throw new Error('invalid player');
			}

			if (raw.statusCode == 200 && profile && profile.uuid) {
				return profile.uuid.replace(/-/g, '');
			} else {
				throw new Error(`Could not fetch the uuid for ${player}.`);
			}
		} catch (e) {
			throw new Error('An error has occurred.');
		}
	}

	public hexToRgb(hex: string): string {
		const arrBuff = new ArrayBuffer(4);
		const vw = new DataView(arrBuff);
		vw.setUint32(0, parseInt(hex, 16), false);
		const arrByte = new Uint8Array(arrBuff);

		return `${arrByte[1]}, ${arrByte[2]}, ${arrByte[3]}`;
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	public async lockdownChannel(options: { channel: BushTextChannel | BushNewsChannel; moderator: BushUserResolvable }) {}
	/* eslint-enable @typescript-eslint/no-unused-vars */

	public capitalizeFirstLetter(string: string): string {
		return string.charAt(0)?.toUpperCase() + string.slice(1);
	}

	get arg() {
		return class Arg {
			/**
			 * Casts a phrase to this argument's type.
			 * @param type - The type to cast to.
			 * @param resolver - The type resolver.
			 * @param message - Message that called the command.
			 * @param phrase - Phrase to process.
			 */
			public static cast(type: BushArgumentType, resolver: TypeResolver, message: Message, phrase: string): Promise<any> {
				return Argument.cast(type, resolver, message, phrase);
			}

			/**
			 * Creates a type that is the left-to-right composition of the given types.
			 * If any of the types fails, the entire composition fails.
			 * @param types - Types to use.
			 */
			public static compose(...types: BushArgumentType[]): ArgumentTypeCaster {
				return Argument.compose(...types);
			}

			/**
			 * Creates a type that is the left-to-right composition of the given types.
			 * If any of the types fails, the composition still continues with the failure passed on.
			 * @param types - Types to use.
			 */
			public static composeWithFailure(...types: BushArgumentType[]): ArgumentTypeCaster {
				return Argument.composeWithFailure(...types);
			}

			/**
			 * Checks if something is null, undefined, or a fail flag.
			 * @param value - Value to check.
			 */
			public static isFailure(value: any): value is null | undefined | (Flag & { value: any }) {
				return Argument.isFailure(value);
			}

			/**
			 * Creates a type from multiple types (product type).
			 * Only inputs where each type resolves with a non-void value are valid.
			 * @param types - Types to use.
			 */
			public static product(...types: BushArgumentType[]): ArgumentTypeCaster {
				return Argument.product(...types);
			}

			/**
			 * Creates a type where the parsed value must be within a range.
			 * @param type - The type to use.
			 * @param min - Minimum value.
			 * @param max - Maximum value.
			 * @param inclusive - Whether or not to be inclusive on the upper bound.
			 */
			public static range(type: BushArgumentType, min: number, max: number, inclusive?: boolean): ArgumentTypeCaster {
				return Argument.range(type, min, max, inclusive);
			}

			/**
			 * Creates a type that parses as normal but also tags it with some data.
			 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
			 * @param type - The type to use.
			 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
			 */
			public static tagged(type: BushArgumentType, tag?: any): ArgumentTypeCaster {
				return Argument.tagged(type, tag);
			}

			/**
			 * Creates a type from multiple types (union type).
			 * The first type that resolves to a non-void value is used.
			 * Each type will also be tagged using `tagged` with themselves.
			 * @param types - Types to use.
			 */
			public static taggedUnion(...types: BushArgumentType[]): ArgumentTypeCaster {
				return Argument.taggedUnion(...types);
			}

			/**
			 * Creates a type that parses as normal but also tags it with some data and carries the original input.
			 * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
			 * @param type - The type to use.
			 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
			 */
			public static taggedWithInput(type: BushArgumentType, tag?: any): ArgumentTypeCaster {
				return Argument.taggedWithInput(type, tag);
			}

			/**
			 * Creates a type from multiple types (union type).
			 * The first type that resolves to a non-void value is used.
			 * @param types - Types to use.
			 */
			public static union(...types: BushArgumentType[]): ArgumentTypeCaster {
				return Argument.union(...types);
			}

			/**
			 * Creates a type with extra validation.
			 * If the predicate is not true, the value is considered invalid.
			 * @param type - The type to use.
			 * @param predicate - The predicate function.
			 */
			public static validate(type: BushArgumentType, predicate: ParsedValuePredicate): ArgumentTypeCaster {
				return Argument.validate(type, predicate);
			}

			/**
			 * Creates a type that parses as normal but also carries the original input.
			 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
			 * @param type - The type to use.
			 */
			public static withInput(type: BushArgumentType): ArgumentTypeCaster {
				return Argument.withInput(type);
			}
		};
	}

	/**
	 * Wait an amount in seconds.
	 */
	public async sleep(s: number): Promise<unknown> {
		return new Promise((resolve) => setTimeout(resolve, s * 1000));
	}

	public async handleError(context: string, error: Error) {
		await client.console.error(_.camelCase(context), `An error occurred:\n${error?.stack ?? (error as any)}`, false);
		await client.console.channelError({
			embeds: [await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error, context })]
		});
	}

	public async resolveNonCachedUser(user: UserResolvable | undefined | null): Promise<User | undefined> {
		if (!user) return undefined;
		const id =
			user instanceof User || user instanceof GuildMember || user instanceof ThreadMember
				? user.id
				: user instanceof Message
				? user.author.id
				: typeof user === 'string'
				? user
				: undefined;
		if (!id) return undefined;
		else return await client.users.fetch(id).catch(() => undefined);
	}

	public async getPronounsOf(user: User | Snowflake): Promise<Pronoun | undefined> {
		const _user = await this.resolveNonCachedUser(user);
		if (!_user) throw new Error(`Cannot find user ${user}`);
		const apiRes: { pronouns: PronounCode } | undefined = await fetch(
			`https://pronoundb.org/api/v1/lookup?platform=discord&id=${_user.id}`
		).then(async (r) => (r.ok ? ((await r.json()) as { pronouns: PronounCode }) : undefined));

		if (!apiRes) return undefined;
		if (!apiRes.pronouns) throw new Error('apiRes.pronouns is undefined');

		return client.constants.pronounMapping[apiRes.pronouns];
	}

	// modified from https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class
	// answer by Bruno Grieder
	public getMethods(obj: any): string {
		let props: string[] = [];

		do {
			const l = Object.getOwnPropertyNames(obj)
				.concat(Object.getOwnPropertySymbols(obj).map((s) => s.toString()))
				.sort()
				.filter(
					(p, i, arr) =>
						typeof Object.getOwnPropertyDescriptor(obj, p)?.['get'] !== 'function' && // ignore getters
						typeof Object.getOwnPropertyDescriptor(obj, p)?.['set'] !== 'function' && // ignore  setters
						typeof obj[p] === 'function' && //only the methods
						p !== 'constructor' && //not the constructor
						(i == 0 || p !== arr[i - 1]) && //not overriding in this prototype
						props.indexOf(p) === -1 //not overridden in a child
				);
			l.forEach((p) => console.debug(Object.getOwnPropertyDescriptor(obj, p)));

			props = props.concat(
				l.map((p) => (obj[p] && obj[p][Symbol.toStringTag] === 'AsyncFunction' ? `async ${p}();` : `${p}();`))
			);
		} while (
			(obj = Object.getPrototypeOf(obj)) && //walk-up the prototype chain
			Object.getPrototypeOf(obj) //not the the Object prototype methods (hasOwnProperty, etc...)
		);

		return props.join('\n');
	}

	/**
	 * Discord.js's Util class
	 */
	get discord() {
		return DiscordUtil;
	}

	/**
	 * discord-akairo's Util class
	 */
	get akairo() {
		return AkairoUtil;
	}
}
