import { exec } from 'child_process';
import { ClientUtil, Command } from 'discord-akairo';
import {
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIMessage,
	APIRole,
	ApplicationCommandOptionType
} from 'discord-api-types';
import {
	ButtonInteraction,
	CommandInteraction,
	CommandInteractionOption,
	Constants,
	Guild,
	GuildChannel,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEditOptions,
	MessageEmbed,
	MessageOptions,
	Role,
	Snowflake,
	TextChannel,
	User,
	Util,
	WebhookEditMessageOptions
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

export class BushClientUtil extends ClientUtil {
	/** The client of this ClientUtil */
	public declare client: BushClient;
	/** The hastebin urls used to post to hastebin, attempts to post in order */
	public hasteURLs: string[] = [
		'https://hst.sh',
		'https://hasteb.in',
		'https://hastebin.com',
		'https://mystb.in',
		'https://haste.clicksminuteper.net',
		'https://paste.pythondiscord.com',
		'https://haste.unbelievaboat.com',
		'https://haste.tyman.tech'
	];
	public paginateEmojis = {
		beginning: '853667381335162910',
		back: '853667410203770881',
		stop: '853667471110570034',
		forward: '853667492680564747',
		end: '853667514915225640'
	};

	/** A simple promise exec method */
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
				this.client.console.error('Haste', `Unable to upload haste to ${url}`);
				continue;
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

	/** Commonly Used Colors */
	public colors = {
		default: '#1FD8F1',
		error: '#EF4947',
		warn: '#FEBA12',
		success: '#3BB681',
		info: '#3B78FF',
		red: '#ff0000',
		blue: '#0055ff',
		aqua: '#00bbff',
		purple: '#8400ff',
		blurple: '#5440cd',
		pink: '#ff00e6',
		green: '#00ff1e',
		darkGreen: '#008f11',
		gold: '#b59400',
		yellow: '#ffff00',
		white: '#ffffff',
		gray: '#a6a6a6',
		lightGray: '#cfcfcf',
		darkGray: '#7a7a7a',
		black: '#000000',
		orange: '#E86100'
	};

	/** Commonly Used Emojis */
	public emojis = {
		success: '<:checkmark:837109864101707807>',
		warn: '<:warn:848726900876247050>	',
		error: '<:error:837123021016924261>',
		successFull: '<:checkmark_full:850118767576088646>',
		warnFull: '<:warn_full:850118767391539312>',
		errorFull: '<:error_full:850118767295201350>',
		mad: '<:mad:783046135392239626>',
		join: '<:join:850198029809614858>',
		leave: '<:leave:850198048205307919>',
		loading: '<a:Loading:853419254619963392>'
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

	public async syncSlashCommands(force = false, guild?: Snowflake): Promise<void> {
		let fetchedGuild: Guild;
		if (guild) fetchedGuild = this.client.guilds.cache.get(guild);
		try {
			const registered =
				guild === undefined ? await this.client.application.commands.fetch() : await fetchedGuild.commands.fetch();
			for (const [, registeredCommand] of registered) {
				if (!this.client.commandHandler.modules.find((cmd) => cmd.id == registeredCommand.name)?.execSlash || force) {
					guild === undefined
						? await this.client.application.commands.delete(registeredCommand.id)
						: await fetchedGuild.commands.delete(registeredCommand.id);
					this.client.logger.verbose(
						'syncSlashCommands',
						`Deleted slash command <<${registeredCommand.name}>>${
							guild !== undefined ? ` in guild <<${fetchedGuild.name}>>` : ''
						}`
					);
				}
			}

			for (const [, botCommand] of this.client.commandHandler.modules) {
				if (botCommand.execSlash) {
					const found = registered.find((i) => i.name == botCommand.id);
					Command;
					const slashdata = {
						name: botCommand.id,
						description: botCommand.description.content,
						options: botCommand.options.slashCommandOptions
					};
					botCommand;

					if (found?.id && !force) {
						if (slashdata.description !== found.description) {
							guild === undefined
								? await this.client.application.commands.edit(found.id, slashdata)
								: fetchedGuild.commands.edit(found.id, slashdata);
							this.client.logger.verbose(
								'syncSlashCommands',
								`Edited slash command <<${botCommand.id}>>${guild !== undefined ? ` in guild <<${fetchedGuild?.name}>>` : ''}`
							);
						}
					} else {
						guild === undefined
							? await this.client.application.commands.create(slashdata)
							: fetchedGuild.commands.create(slashdata);
						this.client.logger.verbose(
							'syncSlashCommands',
							`Created slash command <<${botCommand.id}>>${guild !== undefined ? ` in guild <<${fetchedGuild?.name}>>` : ''}}`
						);
					}
				}
			}

			return this.client.logger.log(
				'syncSlashCommands',
				`Slash commands registered${guild !== undefined ? ` in guild <<${fetchedGuild?.name}>>` : ''}`
			);
		} catch (e) {
			return this.client.logger.error(
				'syncSlashCommands',
				`Slash commands not registered${
					guild !== undefined ? ` in guild <<${fetchedGuild?.name}>>` : ''
				}, with the following error:\n${e?.stack}`
			);
		}
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

	/** Paginates an array of embeds using buttons. */
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
		const msg = (await message.util.reply({
			content: text,
			embeds: [embeds[curPage]],
			components: [getPaginationRow()]
		})) as Message;
		const filter = (interaction: ButtonInteraction) =>
			interaction.customID.startsWith('paginate_') && interaction.message == msg;
		const collector = msg.createMessageComponentInteractionCollector(filter, { time: 300000 });
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id == message.author.id || this.client.config.owners.includes(interaction.user.id)) {
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
							await interaction.deferUpdate().catch(() => {});
							if (msg.deletable && !msg.deleted) {
								await msg.delete();
							}
						} else {
							await interaction
								?.update({ content: `${text ? text + '\n' : ''}Command closed by user.`, embeds: [], components: [] })
								.catch(() => {});
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
				return await interaction?.deferUpdate().catch(() => {});
			}
		});

		collector.on('end', async () => {
			await msg.edit({ content: text, embeds: [embeds[curPage]], components: [getPaginationRow(true)] }).catch(() => {});
		});

		async function edit(interaction: MessageComponentInteraction): Promise<void> {
			return await interaction
				?.update({ content: text, embeds: [embeds[curPage]], components: [getPaginationRow()] })
				.catch(() => {});
		}
		const paginateEmojis = this.paginateEmojis;
		function getPaginationRow(disableAll = false): MessageActionRow {
			return new MessageActionRow().addComponents(
				new MessageButton({
					style,
					customID: 'paginate_beginning',
					emoji: paginateEmojis.beginning,
					disabled: disableAll || curPage == 0
				}),
				new MessageButton({
					style,
					customID: 'paginate_back',
					emoji: paginateEmojis.back,
					disabled: disableAll || curPage == 0
				}),
				new MessageButton({ style, customID: 'paginate_stop', emoji: paginateEmojis.stop, disabled: disableAll }),
				new MessageButton({
					style,
					customID: 'paginate_next',
					emoji: paginateEmojis.forward,
					disabled: disableAll || curPage == embeds.length - 1
				}),
				new MessageButton({
					style,
					customID: 'paginate_end',
					emoji: paginateEmojis.end,
					disabled: disableAll || curPage == embeds.length - 1
				})
			);
		}
	}

	/** Sends a message with a button for the user to delete it. */
	public async sendWithDeleteButton(message: BushMessage, options: MessageOptions): Promise<void> {
		updateOptions();
		const msg = (await message.util.reply(options as MessageOptions & { split?: false })) as Message;
		const filter = (interaction: ButtonInteraction) => interaction.customID == 'paginate__stop' && interaction.message == msg;
		const collector = msg.createMessageComponentInteractionCollector(filter, { time: 300000 });
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id == message.author.id || this.client.config.owners.includes(interaction.user.id)) {
				await interaction.deferUpdate().catch(() => {});
				if (msg.deletable && !msg.deleted) {
					await msg.delete();
				}
				return;
			} else {
				return await interaction?.deferUpdate().catch(() => {});
			}
		});

		collector.on('end', async () => {
			updateOptions(true, true);
			await msg.edit(options as MessageEditOptions).catch(() => {});
		});

		const paginateEmojis = this.paginateEmojis;
		function updateOptions(edit?: boolean, disable?: boolean) {
			if (edit == undefined) edit = false;
			if (disable == undefined) disable = false;
			options.components = [
				new MessageActionRow().addComponents(
					new MessageButton({
						style: Constants.MessageButtonStyles.PRIMARY,
						customID: 'paginate__stop',
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

	public async slashRespond(
		interaction: CommandInteraction,
		responseOptions: string | InteractionReplyOptions
	): Promise<Message | APIMessage | void> {
		let newResponseOptions: InteractionReplyOptions | WebhookEditMessageOptions = {};
		if (typeof responseOptions === 'string') {
			newResponseOptions.content = responseOptions;
		} else {
			newResponseOptions = responseOptions;
		}
		if (interaction.replied || interaction.deferred) {
			//@ts-expect-error: stop being dumb
			delete newResponseOptions.ephemeral; // Cannot change a preexisting message to be ephemeral
			return (await interaction.editReply(newResponseOptions)) as APIMessage;
		} else {
			await interaction.reply(newResponseOptions);
			return await interaction.fetchReply().catch(() => {});
		}
	}

	/** Gets the channel configs as a TextChannel */
	public getConfigChannel(channel: 'log' | 'error' | 'dm'): Promise<TextChannel> {
		return this.client.channels.fetch(this.client.config.channels[channel]) as Promise<TextChannel>;
	}

	/** A bunch of mappings */
	public mappings = {
		guilds: {
			bush: '516977525906341928',
			tree: '767448775450820639',
			staff: '784597260465995796',
			space_ship: '717176538717749358',
			sbr: '839287012409999391'
		},

		permissions: {
			CREATE_INSTANT_INVITE: { name: 'Create Invite', important: false },
			KICK_MEMBERS: { name: 'Kick Members', important: true },
			BAN_MEMBERS: { name: 'Ban Members', important: true },
			ADMINISTRATOR: { name: 'Administrator', important: true },
			MANAGE_CHANNELS: { name: 'Manage Channels', important: true },
			MANAGE_GUILD: { name: 'Manage Server', important: true },
			ADD_REACTIONS: { name: 'Add Reactions', important: false },
			VIEW_AUDIT_LOG: { name: 'View Audit Log', important: true },
			PRIORITY_SPEAKER: { name: 'Priority Speaker', important: true },
			STREAM: { name: 'Video', important: false },
			VIEW_CHANNEL: { name: 'View Channel', important: false },
			SEND_MESSAGES: { name: 'Send Messages', important: false },
			SEND_TTS_MESSAGES: { name: 'Send Text-to-Speech Messages', important: true },
			MANAGE_MESSAGES: { name: 'Manage Messages', important: true },
			EMBED_LINKS: { name: 'Embed Links', important: false },
			ATTACH_FILES: { name: 'Attach Files', important: false },
			READ_MESSAGE_HISTORY: { name: 'Read Message History', important: false },
			MENTION_EVERYONE: { name: 'Mention @​everyone, @​here, and All Roles', important: true }, // name has a zero-width space to prevent accidents
			USE_EXTERNAL_EMOJIS: { name: 'Use External Emoji', important: false },
			VIEW_GUILD_INSIGHTS: { name: 'View Server Insights', important: true },
			CONNECT: { name: 'Connect', important: false },
			SPEAK: { name: 'Speak', important: false },
			MUTE_MEMBERS: { name: 'Mute Members', important: true },
			DEAFEN_MEMBERS: { name: 'Deafen Members', important: true },
			MOVE_MEMBERS: { name: 'Move Members', important: true },
			USE_VAD: { name: 'Use Voice Activity', important: false },
			CHANGE_NICKNAME: { name: 'Change Nickname', important: false },
			MANAGE_NICKNAMES: { name: 'Change Nicknames', important: true },
			MANAGE_ROLES: { name: 'Manage Roles', important: true },
			MANAGE_WEBHOOKS: { name: 'Manage Webhooks', important: true },
			MANAGE_EMOJIS: { name: 'Manage Emojis', important: true },
			USE_APPLICATION_COMMANDS: { name: 'Use Slash Commands', important: false },
			REQUEST_TO_SPEAK: { name: 'Request to Speak', important: false },
			USE_PUBLIC_THREADS: { name: 'Use Public Threads', important: false },
			USE_PRIVATE_THREADS: { name: 'Use Private Threads', important: true }
		},

		features: {
			ANIMATED_ICON: { name: 'Animated Icon', important: false, emoji: '<:animatedIcon:850774498071412746>', weight: 14 },
			BANNER: { name: 'Banner', important: false, emoji: '<:banner:850786673150787614>', weight: 15 },
			COMMERCE: { name: 'Store Channels', important: true, emoji: '<:storeChannels:850786692432396338>', weight: 11 },
			COMMUNITY: { name: 'Community', important: false, emoji: '<:community:850786714271875094>', weight: 20 },
			DISCOVERABLE: { name: 'Discoverable', important: true, emoji: '<:discoverable:850786735360966656>', weight: 6 },
			ENABLED_DISCOVERABLE_BEFORE: {
				name: 'Enabled Discovery Before',
				important: false,
				emoji: '<:enabledDiscoverableBefore:850786754670624828>',
				weight: 7
			},
			FEATURABLE: { name: 'Featurable', important: true, emoji: '<:featurable:850786776372084756>', weight: 4 },
			INVITE_SPLASH: { name: 'Invite Splash', important: false, emoji: '<:inviteSplash:850786798246559754>', weight: 16 },
			MEMBER_VERIFICATION_GATE_ENABLED: {
				name: 'Membership Verification Gate',
				important: false,
				emoji: '<:memberVerificationGateEnabled:850786829984858212>',
				weight: 18
			},
			MONETIZATION_ENABLED: { name: 'Monetization Enabled', important: true, emoji: null, weight: 8 },
			MORE_EMOJI: { name: 'More Emoji', important: true, emoji: '<:moreEmoji:850786853497602080>', weight: 3 },
			MORE_STICKERS: { name: 'More Stickers', important: true, emoji: null, weight: 2 },
			NEWS: {
				name: 'Announcement Channels',
				important: false,
				emoji: '<:announcementChannels:850790491796013067>',
				weight: 17
			},
			PARTNERED: { name: 'Partnered', important: true, emoji: '<:partneredServer:850794851955507240>', weight: 1 },
			PREVIEW_ENABLED: { name: 'Preview Enabled', important: true, emoji: '<:previewEnabled:850790508266913823>', weight: 10 },
			RELAY_ENABLED: { name: 'Relay Enabled', important: true, emoji: '<:relayEnabled:850790531441229834>', weight: 5 },
			TICKETED_EVENTS_ENABLED: { name: 'Ticketed Events Enabled', important: true, emoji: null, weight: 9 },
			VANITY_URL: { name: 'Vanity URL', important: false, emoji: '<:vanityURL:850790553079644160>', weight: 12 },
			VERIFIED: { name: 'Verified', important: true, emoji: '<:verified:850795049817473066>', weight: 0 },
			VIP_REGIONS: { name: 'VIP Regions', important: false, emoji: '<:VIPRegions:850794697496854538>', weight: 13 },
			WELCOME_SCREEN_ENABLED: {
				name: 'Welcome Screen Enabled',
				important: false,
				emoji: '<:welcomeScreenEnabled:850790575875817504>',
				weight: 19
			}
		},

		otherEmojis: {
			SERVER_BOOSTER_1: '<:serverBooster1:848740052091142145>',
			SERVER_BOOSTER_2: '<:serverBooster2:848740090506510388>',
			SERVER_BOOSTER_3: '<:serverBooster3:848740124992077835>',
			SERVER_BOOSTER_6: '<:serverBooster6:848740155245461514>',
			SERVER_BOOSTER_9: '<:serverBooster9:848740188846030889>',
			SERVER_BOOSTER_12: '<:serverBooster12:848740304365551668>',
			SERVER_BOOSTER_15: '<:serverBooster15:848740354890137680>',
			SERVER_BOOSTER_18: '<:serverBooster18:848740402886606868>',
			SERVER_BOOSTER_24: '<:serverBooster24:848740444628320256>',
			NITRO: '<:nitro:848740498054971432>',
			BOOSTER: '<:booster:848747775020892200>',
			OWNER: '<:owner:848746439311753286>',
			ADMIN: '<:admin:848963914628333598>',
			SUPERUSER: '<:superUser:848947986326224926>',
			DEVELOPER: '<:developer:848954538111139871>',
			BUSH_VERIFIED: '<:verfied:853360152090771497>',
			BOOST_1: '<:boostitle:853363736679940127>',
			BOOST_2: '<:boostitle:853363752728789075>',
			BOOST_3: '<:boostitle:853363769132056627>',
			TEXT: '<:text:853375537791893524>',
			NEWS: '<:announcements:853375553531674644>',
			VOICE: '<:voice:853375566735212584>',
			STAGE: '<:stage:853375583521210468>',
			STORE: '<:store:853375601175691266>',
			CATEGORY: '<:category:853375615260819476>'
		},

		userFlags: {
			DISCORD_EMPLOYEE: '<:discordEmployee:848742947826434079>',
			PARTNERED_SERVER_OWNER: '<:partneredServerOwner:848743051593777152>',
			HYPESQUAD_EVENTS: '<:hypeSquadEvents:848743108283072553>',
			BUGHUNTER_LEVEL_1: '<:bugHunter:848743239850393640>',
			HOUSE_BRAVERY: '<:hypeSquadBravery:848742910563844127>',
			HOUSE_BRILLIANCE: '<:hypeSquadBrilliance:848742840649646101>',
			HOUSE_BALANCE: '<:hypeSquadBalance:848742877537370133>',
			EARLY_SUPPORTER: '<:earlySupporter:848741030102171648>',
			//'TEAM_USER': '',
			//'SYSTEM': '',
			BUGHUNTER_LEVEL_2: '<:bugHunterGold:848743283080822794>',
			//'VERIFIED_BOT': '',
			EARLY_VERIFIED_BOT_DEVELOPER: '<:earlyVerifiedBotDeveloper:848741079875846174>'
		},

		status: {
			online: '<:online:848937141639577690>',
			idle: '<:idle:848937158261211146>',
			dnd: '<:dnd:848937173780135986>',
			offline: '<:offline:848939387277672448>',
			streaming: '<:streaming:848937187479519242>'
		},

		maybeNitroDiscrims: ['1111', '2222', '3333', '4444', '5555', '6666', '6969', '7777', '8888', '9999'],

		capes: [
			// supporter capes
			{ name: 'patreon1', index: 0 },
			{ name: 'patreon2', index: 1 },
			{ name: 'fade', custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/fade.gif', index: 2 },
			{ name: 'lava', custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/lava.gif', index: 3 },
			{
				name: 'mcworld',
				custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/mcworld_compressed.gif',
				index: 4
			},
			{
				name: 'negative',
				custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/negative_compressed.gif',
				index: 5
			},
			{
				name: 'space',
				custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/space_compressed.gif',
				index: 6
			},
			{ name: 'void', custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/void.gif', index: 7 },
			{ name: 'tunnel', custom: 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/tunnel.gif', index: 8 },
			// Staff capes
			{ name: 'contrib', index: 9 },
			{ name: 'mbstaff', index: 10 },
			{ name: 'ironmoon', index: 11 },
			{ name: 'gravy', index: 12 },
			{ name: 'nullzee', index: 13 },
			// partner capes
			{ name: 'thebakery', index: 14 },
			{ name: 'dsm', index: 15 },
			{ name: 'packshq', index: 16 },
			{ name: 'furf', index: 17 },
			{ name: 'skytils', index: 18 },
			{ name: 'sbp', index: 19 },
			{ name: 'subreddit_light', index: 20 },
			{ name: 'subreddit_dark', index: 21 },
			// streamer capes
			{ name: 'alexxoffi', index: 22 },
			{ name: 'jakethybro', index: 23 },
			{ name: 'krusty', index: 24 },
			{ name: 'soldier', index: 25 },
			{ name: 'zera', index: 26 }
		],
		roleMap: [
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
			{ name: 'No Support', id: '790247359824396319' },
			{ name: 'DJ', id: '782619038403919902' }
		],
		roleWhitelist: {
			'Partner': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Suggester': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator', 'Helper', 'Trial Helper', 'Contributor'],
			'Level Locked': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'No Files': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'No Reactions': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'No Links': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'No Bots': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'No VC': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'No Giveaways': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator', 'Helper'],
			'No Support': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway Donor': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (200m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (100m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (50m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (25m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (10m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (5m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'Giveaway (1m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
			'DJ': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator']
		}
	};
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

	draw(): void {
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

	get PPercentage(): number {
		return this.percentage * 100;
	}

	set PPercentage(x: number) {
		this.percentage = x / 100;
	}
}
