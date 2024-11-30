import { Highlight, TanzaniteClient, addToArray, format, removeFromArray, timestamp, type HighlightWord } from '#lib';
import {
	ChannelType,
	Collection,
	GuildMember,
	type Channel,
	type Message,
	type Snowflake,
	type TextBasedChannel
} from 'discord.js';
import assert from 'node:assert/strict';
import { Time, colors } from '../utils/Constants.js';
import { sanitizeInputForDiscord } from '../utils/Format.js';

const NOTIFY_COOLDOWN = 5 * Time.Minute;
const OWNER_NOTIFY_COOLDOWN = 5 * Time.Minute;
const LAST_MESSAGE_COOLDOWN = 5 * Time.Minute;

type users = Set<Snowflake>;
type channels = Set<Snowflake>;
type word = HighlightWord;
type guild = Snowflake;
type user = Snowflake;
type lastMessage = Date;
type lastDM = Message;

type lastDmInfo = [lastDM: lastDM, guild: guild, channel: Snowflake, highlights: HighlightWord[]];

export class HighlightManager {
	public static keep = new Set<Snowflake>();

	/**
	 * Cached guild highlights.
	 */
	public readonly guildHighlights = new Collection<guild, Collection<word, users>>();

	//// /**
	////  * Cached global highlights.
	////  */
	//// public readonly globalHighlights = new Collection<word, users>();

	/**
	 * A collection of cooldowns of when a user last sent a message in a particular guild.
	 */
	public readonly userLastTalkedCooldown = new Collection<guild, Collection<user, lastMessage>>();

	/**
	 * Users that users have blocked
	 */
	public readonly userBlocks = new Collection<guild, Collection<user, users>>();

	/**
	 * Channels that users have blocked
	 */
	public readonly channelBlocks = new Collection<guild, Collection<user, channels>>();

	/**
	 * A collection of cooldowns of when the bot last sent each user a highlight message.
	 */
	public readonly lastedDMedUserCooldown = new Collection<user, lastDmInfo>();

	/**
	 * @param client The client to use.
	 */
	public constructor(public readonly client: TanzaniteClient) {}

	/**
	 * Sync the cache with the database.
	 */
	public async syncCache(): Promise<void> {
		const highlights = await Highlight.findAll();

		this.guildHighlights.clear();

		for (const highlight of highlights) {
			highlight.words.forEach((word) => {
				if (!this.guildHighlights.has(highlight.guild)) this.guildHighlights.set(highlight.guild, new Collection());
				const guildCache = this.guildHighlights.get(highlight.guild)!;
				if (!guildCache.get(word)) guildCache.set(word, new Set());
				guildCache.get(word)!.add(highlight.user);
			});

			if (!this.userBlocks.has(highlight.guild)) this.userBlocks.set(highlight.guild, new Collection());
			this.userBlocks.get(highlight.guild)!.set(highlight.user, new Set(highlight.blacklistedUsers));

			if (!this.channelBlocks.has(highlight.guild)) this.channelBlocks.set(highlight.guild, new Collection());
			this.channelBlocks.get(highlight.guild)!.set(highlight.user, new Set(highlight.blacklistedChannels));
		}
	}

	/**
	 * Checks a message for highlights.
	 * @param message The message to check.
	 * @returns A collection users mapped to the highlight matched
	 */
	public checkMessage(message: Message): Collection<Snowflake, HighlightWord> {
		// even if there are multiple matches, only the first one is returned
		const ret = new Collection<Snowflake, HighlightWord>();
		if (!message.content || !message.inGuild()) return ret;
		if (!this.guildHighlights.has(message.guildId)) return ret;

		const guildCache = this.guildHighlights.get(message.guildId)!;

		for (const [word, users] of guildCache.entries()) {
			if (!this.isMatch(message.content, word)) continue;

			for (const user of users) {
				if (ret.has(user)) continue;

				if (!message.channel.permissionsFor(user)?.has('ViewChannel')) continue;

				const blockedUsers = this.userBlocks.get(message.guildId)?.get(user) ?? new Set();
				if (blockedUsers.has(message.author.id)) {
					void this.client.console.verbose(
						'Highlight',
						`Highlight ignored because <<${this.client.users.cache.get(user)?.tag ?? user}>> blocked the user <<${
							message.author.tag
						}>>`
					);
					continue;
				}
				const blockedChannels = this.channelBlocks.get(message.guildId)?.get(user) ?? new Set();
				if (blockedChannels.has(message.channel.id)) {
					void this.client.console.verbose(
						'Highlight',
						`Highlight ignored because <<${this.client.users.cache.get(user)?.tag ?? user}>> blocked the channel <<${
							message.channel.name
						}>>`
					);
					continue;
				}
				if (message.mentions.has(user)) {
					void this.client.console.verbose(
						'Highlight',
						`Highlight ignored because <<${this.client.users.cache.get(user)?.tag ?? user}>> is already mentioned in the message.`
					);
					continue;
				}
				ret.set(user, word);
			}
		}

		return ret;
	}

	/**
	 * Checks a user provided phrase for their highlights.
	 * @param guild The guild to check in.
	 * @param user The user to get the highlights for.
	 * @param phrase The phrase for highlights in.
	 * @returns A collection of the user's highlights mapped to weather or not it was matched.
	 */
	public async checkPhrase(guild: Snowflake, user: Snowflake, phrase: string): Promise<Collection<HighlightWord, boolean>> {
		const highlights = await Highlight.findAll({ where: { guild, user } });

		const results = new Collection<HighlightWord, boolean>();

		for (const highlight of highlights) {
			for (const word of highlight.words) {
				results.set(word, this.isMatch(phrase, word));
			}
		}

		return results;
	}

	/**
	 * Checks a particular highlight for a match within a phrase.
	 * @param phrase The phrase to check for the word in.
	 * @param hl The highlight to check for.
	 * @returns Whether or not the highlight was matched.
	 */
	private isMatch(phrase: string, hl: HighlightWord): boolean {
		if (hl.regex) {
			return new RegExp(hl.word, 'gi').test(phrase);
		} else {
			if (hl.word.includes(' ')) {
				return phrase.toLocaleLowerCase().includes(hl.word.toLocaleLowerCase());
			} else {
				const words = phrase.split(/\s*\b\s/);
				return words.some((w) => w.toLocaleLowerCase() === hl.word.toLocaleLowerCase());
			}
		}
	}

	/**
	 * Adds a new highlight to a user in a particular guild.
	 * @param guild The guild to add the highlight to.
	 * @param user The user to add the highlight to.
	 * @param hl The highlight to add.
	 * @returns A string representing a user error or a boolean indicating the database success.
	 */
	public async addHighlight(guild: Snowflake, user: Snowflake, hl: HighlightWord): Promise<string | boolean> {
		if (!this.guildHighlights.has(guild)) this.guildHighlights.set(guild, new Collection());
		const guildCache = this.guildHighlights.get(guild)!;

		if (!guildCache.has(hl)) guildCache.set(hl, new Set());
		guildCache.get(hl)!.add(user);

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		if (highlight.words.some((w) => w.word === hl.word)) return `You have already highlighted "${hl.word}".`;

		highlight.words = addToArray(highlight.words, hl);

		return Boolean(await highlight.save().catch(() => false));
	}

	/**
	 * Removes a highlighted word for a user in a particular guild.
	 * @param guild The guild to remove the highlight from.
	 * @param user The user to remove the highlight from.
	 * @param hl The word to remove.
	 * @returns A string representing a user error or a boolean indicating the database success.
	 */
	public async removeHighlight(guild: Snowflake, user: Snowflake, hl: string): Promise<string | boolean> {
		if (!this.guildHighlights.has(guild)) this.guildHighlights.set(guild, new Collection());
		const guildCache = this.guildHighlights.get(guild)!;

		const wordCache = guildCache.find((_, key) => key.word === hl);

		if (!wordCache?.has(user)) return `You have not highlighted "${hl}".`;

		wordCache.delete(user);

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		const toRemove = highlight.words.find((w) => w.word === hl);
		if (!toRemove) return `Uhhhhh... This shouldn't happen.`;

		highlight.words = removeFromArray(highlight.words, toRemove);

		return Boolean(await highlight.save().catch(() => false));
	}

	/**
	 * Remove all highlight words for a user in a particular guild.
	 * @param guild The guild to remove the highlights from.
	 * @param user The user to remove the highlights from.
	 * @returns A boolean indicating the database success.
	 */
	public async removeAllHighlights(guild: Snowflake, user: Snowflake): Promise<boolean> {
		if (!this.guildHighlights.has(guild)) this.guildHighlights.set(guild, new Collection());
		const guildCache = this.guildHighlights.get(guild)!;

		for (const [word, users] of guildCache.entries()) {
			if (users.has(user)) users.delete(user);
			if (users.size === 0) guildCache.delete(word);
		}

		const highlight = await Highlight.findOne({ where: { guild, user } });
		if (!highlight) return false;

		highlight.words = [];

		return Boolean(await highlight.save().catch(() => false));
	}

	/**
	 * Adds a new user or channel block to a user in a particular guild.
	 * @param guild The guild to add the block to.
	 * @param user The user that is blocking the target.
	 * @param target The target that is being blocked.
	 * @returns The result of the operation.
	 */
	public async addBlock(
		guild: Snowflake,
		user: Snowflake,
		target: GuildMember | TextBasedChannel
	): Promise<HighlightBlockResult> {
		const cacheKey = `${target instanceof GuildMember ? 'user' : 'channel'}Blocks` as const;
		const databaseKey = `blacklisted${target instanceof GuildMember ? 'Users' : 'Channels'}` as const;

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		if (highlight[databaseKey].includes(target.id)) return HighlightBlockResult.ALREADY_BLOCKED;

		const newBlocks = addToArray(highlight[databaseKey], target.id);

		highlight[databaseKey] = newBlocks;
		const res = await highlight.save().catch(() => false);
		if (!res) return HighlightBlockResult.ERROR;

		if (!this[cacheKey].has(guild)) this[cacheKey].set(guild, new Collection());
		const guildBlocks = this[cacheKey].get(guild)!;
		guildBlocks.set(user, new Set(newBlocks));

		return HighlightBlockResult.SUCCESS;
	}

	/**
	 * Removes a user or channel block from a user in a particular guild.
	 * @param guild The guild to remove the block from.
	 * @param user The user that is unblocking the target.
	 * @param target The target that is being unblocked.
	 * @returns The result of the operation.
	 */
	public async removeBlock(guild: Snowflake, user: Snowflake, target: GuildMember | Channel): Promise<HighlightUnblockResult> {
		const cacheKey = `${target instanceof GuildMember ? 'user' : 'channel'}Blocks` as const;
		const databaseKey = `blacklisted${target instanceof GuildMember ? 'Users' : 'Channels'}` as const;

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		if (!highlight[databaseKey].includes(target.id)) return HighlightUnblockResult.NOT_BLOCKED;

		const newBlocks = removeFromArray(highlight[databaseKey], target.id);

		highlight[databaseKey] = newBlocks;
		const res = await highlight.save().catch(() => false);
		if (!res) return HighlightUnblockResult.ERROR;

		if (!this[cacheKey].has(guild)) this[cacheKey].set(guild, new Collection());
		const guildBlocks = this[cacheKey].get(guild)!;
		guildBlocks.set(user, new Set(newBlocks));

		return HighlightUnblockResult.SUCCESS;
	}

	/**
	 * Sends a user a direct message to alert them of their highlight being triggered.
	 * @param message The message that triggered the highlight.
	 * @param user The user who's highlights was triggered.
	 * @param hl The highlight that was matched.
	 * @returns Whether or a dm was sent.
	 */
	public async notify(message: Message, user: Snowflake, hl: HighlightWord): Promise<boolean> {
		assert(message.inGuild());

		this.client.console.debug(`Notifying ${user} of highlight ${hl.word} in ${message.guild.name}`);

		dmCooldown: {
			const lastDM = this.lastedDMedUserCooldown.get(user);
			if (!lastDM?.[0]) break dmCooldown;

			const cooldown = this.client.config.owners.includes(user) ? OWNER_NOTIFY_COOLDOWN : NOTIFY_COOLDOWN;

			if (new Date().getTime() - lastDM[0].createdAt.getTime() < cooldown) {
				void this.client.console.verbose('Highlight', `User <<${user}>> has been DMed recently.`);

				if (lastDM[0].embeds.length < 10) {
					this.client.console.debug(`Trying to add to notification queue for ${user}`);
					return this.addToNotification(lastDM, message, hl);
				}

				this.client.console.debug(`User has too many embeds (${lastDM[0].embeds.length}).`);
				return false;
			}
		}

		talkCooldown: {
			const lastTalked = this.userLastTalkedCooldown.get(message.guildId)?.get(user);
			if (!lastTalked) break talkCooldown;

			presence: {
				// incase the bot left the guild
				if (!message.guild) {
					this.client.console.debug(`No guild found for ${message.id}`);
					break presence;
				}

				const member = message.guild.members.cache.get(user);
				if (!member) {
					this.client.console.debug(`No member found for ${user} in ${message.guild.name}`);
					break presence;
				}

				const presence = member.presence ?? (await member.fetch()).presence;
				if (!presence) {
					this.client.console.debug(`No presence found for ${user} in ${message.guild.name}`);
					break presence;
				}

				if (presence.status === 'offline') {
					void this.client.console.verbose('Highlight', `User <<${user}>> is offline.`);
					break talkCooldown;
				}
			}

			const now = new Date().getTime();
			const talked = lastTalked.getTime();

			if (now - talked < LAST_MESSAGE_COOLDOWN) {
				void this.client.console.verbose('Highlight', `User <<${user}>> has talked too recently.`);

				setTimeout(() => {
					const newTalked = this.userLastTalkedCooldown.get(message.guildId)?.get(user)?.getTime();
					if (talked !== newTalked) return;

					void this.notify(message, user, hl);
				}, LAST_MESSAGE_COOLDOWN).unref();

				return false;
			}
		}

		return this.client.users
			.send(user, {
				content: `In ${format.input(message.guild.name)} ${message.channel}, your highlight "${hl.word}" was matched:`,
				embeds: [this.generateDmEmbed(message, hl)]
			})
			.then((dm) => {
				this.lastedDMedUserCooldown.set(user, [dm, message.guildId, message.channelId, [hl]]);
				return true;
			})
			.catch(() => false);
	}

	private async addToNotification(
		[originalDm, guild, channel, originalHl]: lastDmInfo,
		message: Message,
		hl: HighlightWord
	): Promise<boolean> {
		assert(originalDm.embeds.length < 10);
		assert(originalDm.embeds.length > 0);
		assert(originalDm.channel.type === ChannelType.DM);
		this.client.console.debug(
			`Adding to notification queue for ${originalDm.channel.recipient?.tag ?? originalDm.channel.recipientId}`
		);

		const sameGuild = guild === message.guildId;
		const sameChannel = channel === message.channel.id;
		const sameWord = originalHl.every((w) => w.word === hl.word);

		return originalDm
			.edit({
				content: `In ${sameGuild ? format.input(message.guild?.name ?? '[Unknown]') : 'multiple servers'} ${
					sameChannel ? (message.channel ?? '[Unknown]') : 'multiple channels'
				}, ${sameWord ? `your highlight "${hl.word}" was matched:` : 'multiple highlights were matched:'}`,
				embeds: [...originalDm.embeds.map((e) => e.toJSON()), this.generateDmEmbed(message, hl)]
			})
			.then(() => true)
			.catch(() => false);
	}

	private generateDmEmbed(message: Message, hl: HighlightWord) {
		// janky MessageManager typings
		assert(message.inGuild());

		const recentMessages = message.channel.messages.cache
			.filter((m) => m.createdTimestamp <= message.createdTimestamp && m.id !== message.id)
			.filter((m) => m.cleanContent?.trim().length > 0)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first(4)
			.reverse();

		return {
			description: [
				message.channel.toString(),
				...[...recentMessages, message].map(
					(m) => `${timestamp(m.createdAt, 't')} ${format.input(`${m.author.tag}:`)} ${m.cleanContent.trim().substring(0, 512)}`
				)
			].join('\n'),
			author: { name: hl.regex ? `/${hl.word}/gi` : hl.word },
			fields: [{ name: 'Source message', value: `[Jump to message](${message.url})` }],
			color: colors.default,
			footer: { text: `Triggered in ${sanitizeInputForDiscord(`${message.guild}`)}` },
			timestamp: message.createdAt.toISOString()
		};
	}

	/**
	 * Updates the time that a user last talked in a particular guild.
	 * @param message The message the user sent.
	 */
	public updateLastTalked(message: Message): void {
		if (!message.inGuild()) return;
		const lastTalked = (
			this.userLastTalkedCooldown.has(message.guildId)
				? this.userLastTalkedCooldown
				: this.userLastTalkedCooldown.set(message.guildId, new Collection())
		).get(message.guildId)!;

		lastTalked.set(message.author.id, new Date());
		if (!HighlightManager.keep.has(message.author.id)) HighlightManager.keep.add(message.author.id);
	}
}

export enum HighlightBlockResult {
	ALREADY_BLOCKED,
	ERROR,
	SUCCESS
}

export enum HighlightUnblockResult {
	NOT_BLOCKED,
	ERROR,
	SUCCESS
}
