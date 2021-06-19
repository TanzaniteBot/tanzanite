/* eslint-disable @typescript-eslint/no-explicit-any */
import { AkairoMessage, Category, CommandHandler, CommandHandlerOptions, CommandUtil, Util } from 'discord-akairo';
import { Collection, CommandInteraction, GuildMember, Interaction } from 'discord.js';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushMessage } from './BushMessage';

export const ArgumentMatches = {
	PHRASE: 'phrase',
	FLAG: 'flag',
	OPTION: 'option',
	REST: 'rest',
	SEPARATE: 'separate',
	TEXT: 'text',
	CONTENT: 'content',
	REST_CONTENT: 'restContent',
	NONE: 'none'
};

export const ArgumentTypes = {
	STRING: 'string',
	LOWERCASE: 'lowercase',
	UPPERCASE: 'uppercase',
	CHAR_CODES: 'charCodes',
	NUMBER: 'number',
	INTEGER: 'integer',
	BIGINT: 'bigint',
	EMOJINT: 'emojint',
	URL: 'url',
	DATE: 'date',
	COLOR: 'color',
	USER: 'user',
	USERS: 'users',
	MEMBER: 'member',
	MEMBERS: 'members',
	RELEVANT: 'relevant',
	RELEVANTS: 'relevants',
	CHANNEL: 'channel',
	CHANNELS: 'channels',
	TEXT_CHANNEL: 'textChannel',
	TEXT_CHANNELS: 'textChannels',
	VOICE_CHANNEL: 'voiceChannel',
	VOICE_CHANNELS: 'voiceChannels',
	CATEGORY_CHANNEL: 'categoryChannel',
	CATEGORY_CHANNELS: 'categoryChannels',
	NEWS_CHANNEL: 'newsChannel',
	NEWS_CHANNELS: 'newsChannels',
	STORE_CHANNEL: 'storeChannel',
	STORE_CHANNELS: 'storeChannels',
	ROLE: 'role',
	ROLES: 'roles',
	EMOJI: 'emoji',
	EMOJIS: 'emojis',
	GUILD: 'guild',
	GUILDS: 'guilds',
	MESSAGE: 'message',
	GUILD_MESSAGE: 'guildMessage',
	RELEVANT_MESSAGE: 'relevantMessage',
	INVITE: 'invite',
	MEMBER_MENTION: 'memberMention',
	CHANNEL_MENTION: 'channelMention',
	ROLE_MENTION: 'roleMention',
	EMOJI_MENTION: 'emojiMention',
	COMMAND_ALIAS: 'commandAlias',
	COMMAND: 'command',
	INHIBITOR: 'inhibitor',
	LISTENER: 'listener'
};

export const blockedReasons = {
	DM: 'dm',
	BOT: 'bot',
	GUILD: 'guild',
	OWNER: 'owner',
	CLIENT: 'client',
	DISABLED: 'disabled',
	SUPERUSER: 'superuser',
	ROLE_BLACKLIST: 'roleBlacklist',
	USER_BLACKLIST: 'userBlacklist',
	RESTRICTED_GUILD: 'restrictedGuild',
	CHANNEL_BLACKLIST: 'channelBlacklist',
	RESTRICTED_CHANNEL: 'restrictedChannel'
};

export const CommandHandlerEvents = {
	MESSAGE_BLOCKED: 'messageBlocked',
	MESSAGE_INVALID: 'messageInvalid',
	COMMAND_BLOCKED: 'commandBlocked',
	COMMAND_STARTED: 'commandStarted',
	COMMAND_FINISHED: 'commandFinished',
	COMMAND_CANCELLED: 'commandCancelled',
	COMMAND_LOCKED: 'commandLocked',
	COMMAND_INVALID: 'commandInvalid',
	COMMAND_LOCKED_NSFW: 'commandLockedNsfw',
	MISSING_PERMISSIONS: 'missingPermissions',
	COOLDOWN: 'cooldown',
	IN_PROMPT: 'inPrompt',
	ERROR: 'error',
	SLASH_COMMAND_BLOCKED: 'slashCommandBlocked'
};

// A large amount of this code is copied from Akairo so that I can add custom checks to it.
export class BushCommandHandler extends CommandHandler {
	public declare client: BushClient;
	public declare modules: Collection<string, BushCommand>;
	public declare categories: Collection<string, Category<string, BushCommand>>;
	public constructor(client: BushClient, options: CommandHandlerOptions) {
		super(client, options);
		this.client = client;
	}

	async handleSlash(interaction: Interaction): Promise<boolean> {
		if (!interaction.isCommand()) return false;

		if (await this.runAllTypeInhibitors(interaction)) {
			return false;
		}

		if (!interaction.guildID) {
			this.emit('slashGuildOnly', interaction);
			return false;
		}
		const command = this.findCommand(interaction.commandName) as BushCommand;
		const before = command.before(interaction);
		if (Util.isPromise(before)) await before;

		if (!command) {
			this.emit('slashNotFound', interaction);
			return false;
		}

		if (command.ownerOnly && !this.client.isOwner(interaction.user)) {
			this.emit('slashBlocked', interaction, command, 'owner');
			return false;
		}
		if (command.superUserOnly && !this.client.isSuperUser(interaction.user)) {
			this.emit('slashBlocked', interaction, command, 'superuser');
			return false;
		}

		if (interaction.channel.type !== 'dm') {
			const userPermissions = interaction.channel.permissionsFor(interaction.member as GuildMember).toArray();

			if (command.userPermissions) {
				const userMissingPermissions =
					typeof command.userPermissions === 'object'
						? command.userPermissions.filter((p) => !userPermissions.includes(p))
						: '';
				if (command.userPermissions && command.userPermissions.length > 0 && userMissingPermissions.length > 0) {
					this.emit('slashMissingPermissions', interaction, command, 'user', userMissingPermissions);
					return false;
				}
			}

			const clientPermissions = interaction.channel.permissionsFor(interaction.guild.me).toArray();

			if (command.clientPermissions) {
				const clientMissingPermissions = command.clientPermissions.filter((p) => !clientPermissions.includes(p));
				if (command.clientPermissions && command.clientPermissions.length > 0 && clientMissingPermissions.length > 0) {
					this.emit('slashMissingPermissions', interaction, command, 'client', clientMissingPermissions);
					return false;
				}
			}
		}

		//@ts-ignore: Typings are wrong
		if (this.runCooldowns(interaction, command)) {
			return true;
		}
		const message = new AkairoMessage(this.client, interaction, {
			slash: true,
			replied: this.autoDefer || command.slashEphemeral
		});

		if (this.commandUtil) {
			if (this.commandUtils.has(message.id)) {
				message.util = this.commandUtils.get(message.id);
			} else {
				message.util = new CommandUtil(this, message);
				this.commandUtils.set(message.id, message.util);
			}
		}

		let parsed = await this.parseCommand(message);
		if (!parsed.command) {
			const overParsed = await this.parseCommandOverwrittenPrefixes(message);
			if (overParsed.command || (parsed.prefix == null && overParsed.prefix != null)) {
				parsed = overParsed;
			}
		}

		if (this.commandUtil) {
			message.util.parsed = parsed;
		}

		try {
			if (this.autoDefer || command.slashEphemeral) {
				await interaction.defer(command.slashEphemeral);
			}
			const convertedOptions = {};
			for (const option of interaction.options.values()) {
				if (option.member) convertedOptions[option.name] = option.member;
				else if (option.channel) convertedOptions[option.name] = option.channel;
				else if (option.role) convertedOptions[option.name] = option.role;
				else convertedOptions[option.name] = option.value;
			}
			this.emit('slashStarted', interaction, command);

			if (command.execSlash || this.execSlash) await command.execSlash(message, convertedOptions);
			else await command.exec(message, convertedOptions);

			return true;
		} catch (err) {
			this.emit('slashError', err, message, command);
			return false;
		}
	}
	public async runPostTypeInhibitors(message: BushMessage, command: BushCommand): Promise<boolean> {
		if (command.ownerOnly && !message.client.isOwner(message.author)) {
			super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.OWNER);
			return true;
		}
		if (command.superUserOnly && !(this.client.isSuperUser(message.author) || this.client.isOwner(message.author))) {
			super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.SUPERUSER);
			return true;
		}
		if (command.channel === 'guild' && !message.guild) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.GUILD);
			return true;
		}
		if (command.channel === 'dm' && message.guild) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.DM);
			return true;
		}
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.RESTRICTED_CHANNEL);
				return true;
			}
		}
		if (command.restrictedGuilds?.length && message.guild) {
			if (!command.restrictedGuilds.includes(message.guild.id)) {
				this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.RESTRICTED_GUILD);
				return true;
			}
		}
		if (await this.runPermissionChecks(message, command)) {
			return true;
		}
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test('post', message, command) : null;
		if (reason != null) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
			return true;
		}
		if (this.runCooldowns(message, command)) {
			return true;
		}
		return false;
	}
	public async runCommand(message: BushMessage, command: BushCommand, args: unknown): Promise<void> {
		if (command.typing) {
			message.channel.startTyping();
		}
		try {
			this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, args);
			const ret = await command.exec(message, args);
			this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, args, ret);
		} finally {
			if (command.typing) {
				message.channel.stopTyping();
			}
		}
	}
	public runAllTypeInhibitors(message: BushMessage): any;
	public runAllTypeInhibitors(message: BushMessage | CommandInteraction): any;
	public runAllTypeInhibitors(message): any {
		super.runAllTypeInhibitors(message);
	}
}
