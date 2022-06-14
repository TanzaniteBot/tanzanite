import { Highlight, type HighlightWord } from '#lib';
import assert from 'assert';
import { Collection, type Message, type Snowflake } from 'discord.js';
import { Time } from '../utils/BushConstants.js';

const NOTIFY_COOLDOWN = 5 * Time.Minute;
const OWNER_NOTIFY_COOLDOWN = 1 * Time.Minute;
const LAST_MESSAGE_COOLDOWN = 5 * Time.Minute;

type users = Set<Snowflake>;
type channels = Set<Snowflake>;
type word = HighlightWord;
type guild = Snowflake;
type user = Snowflake;
type lastMessage = Date;
type lastDM = Date;

export class HighlightManager {
	/**
	 * Cached guild highlights.
	 */
	public readonly guildHighlights = new Collection<guild, Collection<word, users>>();

	// /**
	//  * Cached global highlights.
	//  */
	// public readonly globalHighlights = new Collection<word, users>();

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
	public readonly lastedDMedUserCooldown = new Collection<user, lastDM>();

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
			this.userBlocks.get(highlight.guild)!.set(highlight.user, new Set(...highlight.blacklistedUsers));

			if (!this.channelBlocks.has(highlight.guild)) this.channelBlocks.set(highlight.guild, new Collection());
			this.channelBlocks.get(highlight.guild)!.set(highlight.user, new Set(...highlight.blacklistedChannels));
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
			if (this.isMatch(message.content, word)) {
				for (const user of users) {
					if (!ret.has(user)) {
						if (!message.channel.permissionsFor(user)?.has('ViewChannel')) continue;

						const blockedUsers = this.userBlocks.get(message.guildId)?.get(user) ?? new Set();
						if (blockedUsers.has(message.author.id)) continue;

						const blockedChannels = this.channelBlocks.get(message.guildId)?.get(user) ?? new Set();
						if (blockedChannels.has(message.channel.id)) continue;

						ret.set(user, word);
					}
				}
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

		highlight.words = util.addToArray(highlight.words, hl);

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

		wordCache!.delete(user);

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		const toRemove = highlight.words.find((w) => w.word === hl);
		if (!toRemove) return `Uhhhhh... This shouldn't happen.`;

		highlight.words = util.removeFromArray(highlight.words, toRemove);

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
	 * Sends a user a direct message to alert them of their highlight being triggered.
	 * @param message The message that triggered the highlight.
	 * @param user The user who's highlights was triggered.
	 * @param hl The highlight that was matched.
	 * @returns Whether or a dm was sent.
	 */
	public async notify(message: Message, user: Snowflake, hl: HighlightWord): Promise<boolean> {
		assert(message.inGuild());

		dmCooldown: {
			const lastDM = this.lastedDMedUserCooldown.get(user);
			if (!lastDM) break dmCooldown;

			const cooldown = client.ownerID.includes(user) ? OWNER_NOTIFY_COOLDOWN : NOTIFY_COOLDOWN;

			if (new Date().getTime() - lastDM.getTime() < cooldown) {
				void client.console.verbose('Highlight', `User <<${user}>> has been dmed recently.`);
				return false;
			}
		}

		talkCooldown: {
			const lastTalked = this.userLastTalkedCooldown.get(message.guildId)?.get(user);
			if (!lastTalked) break talkCooldown;

			const now = new Date().getTime();
			const talked = lastTalked.getTime();

			if (now - talked < LAST_MESSAGE_COOLDOWN) {
				void client.console.verbose('Highlight', `User <<${user}>> has talked too recently.`);

				setTimeout(() => {
					const newTalked = this.userLastTalkedCooldown.get(message.guildId)?.get(user)?.getTime();
					if (talked !== newTalked) return;

					void this.notify(message, user, hl);
				}, LAST_MESSAGE_COOLDOWN).unref();

				return false;
			}
		}

		const recentMessages = message.channel.messages.cache
			.filter((m) => m.createdTimestamp <= message.createdTimestamp && m.id !== message.id)
			.filter((m) => m.cleanContent?.trim().length > 0)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first(4)
			.reverse();

		return client.users
			.send(user, {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				content: `In ${util.format.input(message.guild.name)} ${message.channel}, your highlight "${hl.word}" was matched:`,
				embeds: [
					{
						description: [...recentMessages, message]
							.map(
								(m) =>
									`${util.timestamp(m.createdAt, 't')} ${util.format.input(`${m.author.tag}:`)} ${m.cleanContent
										.trim()
										.substring(0, 512)}`
							)
							.join('\n'),
						author: { name: hl.regex ? `/${hl.word}/gi` : hl.word },
						fields: [{ name: 'Source message', value: `[Jump to message](${message.url})` }],
						color: util.colors.default,
						footer: { text: 'Triggered' },
						timestamp: message.createdAt.toISOString()
					}
				]
			})
			.then(() => {
				this.lastedDMedUserCooldown.set(user, new Date());
				return true;
			})
			.catch(() => false);
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
	}
}
