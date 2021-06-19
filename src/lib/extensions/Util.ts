import { exec } from 'child_process';
import { ClientUtil } from 'discord-akairo';
import {
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
	ApplicationCommandOptionType
} from 'discord-api-types';
import {
	ButtonInteraction,
	CommandInteractionOption,
	Constants,
	GuildChannel,
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEmbed,
	MessageOptions,
	Role,
	Snowflake,
	User,
	Util
} from 'discord.js';
import got from 'got';
import { promisify } from 'util';
import { BushClient } from './BushClient';
import { BushMessage } from './BushMessage';

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

export interface SlashCommandOption<T> {
	name: string;
	type: ApplicationCommandOptionType;
	value?: T;
	options?: CommandInteractionOption[];
	user?: User;
	member?: GuildMember | APIInteractionDataResolvedGuildMember;
	channel?: GuildChannel | APIInteractionDataResolvedChannel;
	role?: Role | APIRole;
}

export class BushUtil extends ClientUtil {
	/**
	 * The client of this ClientUtil
	 * @type {BushClient}
	 */
	public client: BushClient;
	/**
	 * The hastebin urls used to post to hastebin, attempts to post in order
	 * @type {string[]}
	 */
	public hasteURLs = [
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
	 * A simple promise exec method
	 */
	private exec = promisify(exec);

	/**
	 * Creates this client util
	 * @param client The client to initialize with
	 */
	constructor(client: BushClient) {
		super(client);
	}

	/**
	 * Maps an array of user ids to user objects.
	 * @param ids The list of IDs to map
	 * @returns The list of users mapped
	 */
	public async mapIDs(ids: Snowflake[]): Promise<User[]> {
		return await Promise.all(ids.map((id) => this.client.users.fetch(id)));
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
		return await this.exec(command);
	}

	/**
	 * Posts text to hastebin
	 * @param content The text to post
	 * @returns The url of the posted text
	 */
	public async haste(content: string): Promise<string> {
		for (const url of this.hasteURLs) {
			try {
				const res: hastebinRes = await got.post(`${url}/documents`, { body: content }).json();
				return `${url}/${res.key}`;
			} catch (e) {
				// pass
			}
		}
		throw new Error('No urls worked. (wtf)');
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
				const user = await this.client.users.fetch(text as Snowflake);
				return user;
			} catch {
				// pass
			}
		}
		const mentionReg = /<@!?(?<id>\d{17,19})>/;
		const mentionMatch = text.match(mentionReg);
		if (mentionMatch) {
			try {
				const user = await this.client.users.fetch(mentionMatch.groups.id as Snowflake);
				return user;
			} catch {
				// pass
			}
		}
		const user = this.client.users.cache.find((u) => u.username === text);
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
			const ch = Math.floor(i / perChunk);
			all[ch] = [].concat(all[ch] || [], one);
			return all;
		}, []);
	}

	/**
	 * The colors used throught the bot
	 */
	public colors = {
		default: '#1FD8F1',
		error: '#EF4947',
		warn: '#FEBA12',
		success: '#3BB681',
		red: '#ff0000',
		orange: '#E86100',
		gold: '#b59400',
		yellow: '#ffff00',
		green: '#00ff1e',
		darkGreen: '#008f11',
		aqua: '#00bbff',
		blue: '#0055ff',
		blurple: '#5440cd',
		purple: '#8400ff',
		pink: '#ff00e6',
		white: '#ffffff',
		gray: '#a6a6a6',
		lightGray: '#cfcfcf',
		darkGray: '#7a7a7a',
		black: '#000000'
	};

	public emojis = {
		success: '<:checkmark:837109864101707807>',
		warn: '<:warn:848726900876247050>	',
		error: '<:error:837123021016924261>',
		successFull: '<:checkmark_full:850118767576088646>',
		warnFull: '<:warn_full:850118767391539312>',
		errorFull: '<:error_full:850118767295201350>',
		mad: '<:mad:783046135392239626>',
		join: '<:join:850198029809614858>',
		leave: '<:leave:850198048205307919>'
	};

	/**
	 * A simple utility to create and embed with the needed style for the bot
	 */
	public createEmbed(color?: string, author?: User | GuildMember): MessageEmbed {
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

	public moulberryBushRoleMap = [
		{ name: '*', id: '792453550768390194' },
		{ name: 'Admin Perms', id: '746541309853958186' },
		{ name: 'Sr. Moderator', id: '782803470205190164' },
		{ name: 'Moderator', id: '737308259823910992' },
		{ name: 'Helper', id: '737440116230062091' },
		{ name: 'Trial Helper', id: '783537091946479636' },
		{ name: 'Contributor', id: '694431057532944425' },
		{ name: 'Giveaway Donor', id: '784212110263451649' },
		{ name: 'Giveaway (200m)', id: '810267756426690601' },
		{ name: 'Giveaway (100m)', id: '801444430522613802' },
		{ name: 'Giveaway (50m)', id: '787497512981757982' },
		{ name: 'Giveaway (25m)', id: '787497515771232267' },
		{ name: 'Giveaway (10m)', id: '787497518241153025' },
		{ name: 'Giveaway (5m)', id: '787497519768403989' },
		{ name: 'Giveaway (1m)', id: '787497521084891166' },
		{ name: 'Suggester', id: '811922322767609877' },
		{ name: 'Partner', id: '767324547312779274' },
		{ name: 'Level Locked', id: '784248899044769792' },
		{ name: 'No Files', id: '786421005039173633' },
		{ name: 'No Reactions', id: '786421270924361789' },
		{ name: 'No Links', id: '786421269356740658' },
		{ name: 'No Bots', id: '786804858765312030' },
		{ name: 'No VC', id: '788850482554208267' },
		{ name: 'No Giveaways', id: '808265422334984203' },
		{ name: 'No Support', id: '790247359824396319' }
	];

	private paginateEmojis = {
		beggining: '853667381335162910',
		back: '853667410203770881',
		stop: '853667471110570034',
		forward: '853667492680564747',
		end: '853667514915225640'
	};

	public async buttonPaginate(
		message: BushMessage,
		embeds: MessageEmbed[],
		text: string | null = null,
		deleteOnExit?: boolean
	): Promise<void> {
		if (deleteOnExit === undefined) deleteOnExit = true;
		embeds.forEach((_e, i) => {
			embeds[i] = embeds[i].setFooter(`Page ${i + 1}/${embeds.length}`);
		});

		const style = Constants.MessageButtonStyles.PRIMARY;
		let curPage = 0;
		if (typeof embeds !== 'object') throw 'embeds must be an object';
		const msg = await message.util.reply({ content: text, embeds: [embeds[curPage]], components: [getPaginationRow()] });
		const filter = (interaction: ButtonInteraction) =>
			interaction.customID.startsWith('paginate_') && interaction.message == msg;
		const collector = msg.createMessageComponentInteractionCollector(filter, { time: 300000 });
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id == message.author.id || message.client.config.owners.includes(interaction.user.id)) {
				switch (interaction.customID) {
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
							await interaction.deferUpdate();
							await msg.delete();
						} else {
							await interaction?.update({
								content: `${text ? text + '\n' : ''}Command closed by user.`,
								embeds: [],
								components: []
							});
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
				return await interaction?.deferUpdate();
			}
		});

		collector.on('end', async () => {
			await msg.edit({ content: text, embeds: [embeds[curPage]], components: [getPaginationRow(true)] }).catch(() => undefined);
		});

		async function edit(interaction: MessageComponentInteraction): Promise<void> {
			return await interaction?.update({ content: text, embeds: [embeds[curPage]], components: [getPaginationRow()] });
		}
		function getPaginationRow(disableAll = false): MessageActionRow {
			return new MessageActionRow().addComponents(
				new MessageButton({
					style,
					customID: 'paginate_beginning',
					emoji: this.paginateEmojis.beggining,
					disabled: disableAll || curPage == 0
				}),
				new MessageButton({
					style,
					customID: 'paginate_back',
					emoji: this.paginateEmojis.back,
					disabled: disableAll || curPage == 0
				}),
				new MessageButton({ style, customID: 'paginate_stop', emoji: this.paginateEmojis.stop, disabled: disableAll }),
				new MessageButton({
					style,
					customID: 'paginate_next',
					emoji: this.paginateEmojis.forward,
					disabled: disableAll || curPage == embeds.length - 1
				}),
				new MessageButton({
					style,
					customID: 'paginate_end',
					emoji: this.paginateEmojis.end,
					disabled: disableAll || curPage == embeds.length - 1
				})
			);
		}
	}

	public async sendWithDeleteButton(message: BushMessage, options: MessageOptions): Promise<void> {
		updateOptions();
		const msg = await message.util.reply(options as MessageOptions & { split?: false });
		const filter = (interaction: ButtonInteraction) => interaction.customID == 'paginate__stop' && interaction.message == msg;
		const collector = msg.createMessageComponentInteractionCollector(filter, { time: 300000 });
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id == message.author.id || message.client.config.owners.includes(interaction.user.id)) {
				await interaction.deferUpdate();
				await msg.delete();
				return;
			} else {
				return await interaction?.deferUpdate();
			}
		});

		collector.on('end', async () => {
			updateOptions(true, true);
			await msg.edit(options);
		});

		function updateOptions(edit?: boolean, disable?: boolean) {
			if (edit == undefined) edit = false;
			if (disable == undefined) disable = false;
			options.components = [
				new MessageActionRow().addComponents(
					new MessageButton({
						style: Constants.MessageButtonStyles.PRIMARY,
						customID: 'paginate__stop',
						emoji: this.paginateEmojis.stop,
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
	 * Surrounds text in a code block with the specified language and puts it in a haste bin if it too long.
	 *
	 * * Embed Description Limit = 2048 characters
	 * * Embed Field Limit = 1024 characters
	 */
	public async codeblock(code: string, length: number, language: 'ts' | 'js' | 'sh' | 'json' | '' = ''): Promise<string> {
		let hasteOut = '';
		const tildes = '```';
		const formattingLength = 2 * tildes.length + language.length + 2 * '\n'.length;
		if (code.length + formattingLength > length) hasteOut = 'Too large to display. Hastebin: ' + (await this.haste(code));

		const code2 = code.length > length ? code.substring(0, length - (hasteOut.length + '\n'.length + formattingLength)) : code;
		return (
			tildes + language + '\n' + Util.cleanCodeBlockContent(code2) + '\n' + tildes + (hasteOut.length ? '\n' + hasteOut : '')
		);
	}
}

// I just copy pasted this code from stackoverflow don't yell at me if there is issues for it
export class CanvasProgressBar {
	private x: number;
	private y: number;
	private w: number;
	private h: number;
	private color: string;
	private percentage: number;
	private p: number;
	private ctx: CanvasRenderingContext2D;

	constructor(
		ctx: CanvasRenderingContext2D,
		dimension: { x: number; y: number; width: number; height: number },
		color: string,
		percentage: number
	) {
		({ x: this.x, y: this.y, width: this.w, height: this.h } = dimension);
		this.color = color;
		this.percentage = percentage;
		this.p;
		this.ctx = ctx;
	}

	draw() {
		// -----------------
		this.p = this.percentage * this.w;
		if (this.p <= this.h) {
			this.ctx.beginPath();
			this.ctx.arc(
				this.h / 2 + this.x,
				this.h / 2 + this.y,
				this.h / 2,
				Math.PI - Math.acos((this.h - this.p) / this.h),
				Math.PI + Math.acos((this.h - this.p) / this.h)
			);
			this.ctx.save();
			this.ctx.scale(-1, 1);
			this.ctx.arc(
				this.h / 2 - this.p - this.x,
				this.h / 2 + this.y,
				this.h / 2,
				Math.PI - Math.acos((this.h - this.p) / this.h),
				Math.PI + Math.acos((this.h - this.p) / this.h)
			);
			this.ctx.restore();
			this.ctx.closePath();
		} else {
			this.ctx.beginPath();
			this.ctx.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, (3 / 2) * Math.PI);
			this.ctx.lineTo(this.p - this.h + this.x, 0 + this.y);
			this.ctx.arc(this.p - this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, (3 / 2) * Math.PI, Math.PI / 2);
			this.ctx.lineTo(this.h / 2 + this.x, this.h + this.y);
			this.ctx.closePath();
		}
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
	}

	// showWholeProgressBar(){
	//   this.ctx.beginPath();
	//   this.ctx.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, 3 / 2 * Math.PI);
	//   this.ctx.lineTo(this.w - this.h + this.x, 0 + this.y);
	//   this.ctx.arc(this.w - this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, 3 / 2 *Math.PI, Math.PI / 2);
	//   this.ctx.lineTo(this.h / 2 + this.x, this.h + this.y);
	//   this.ctx.strokeStyle = '#000000';
	//   this.ctx.stroke();
	//   this.ctx.closePath();
	// }

	get PPercentage() {
		return this.percentage * 100;
	}

	set PPercentage(x) {
		this.percentage = x / 100;
	}
}
