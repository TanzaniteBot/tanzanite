import { Highlight, type BushMessage, type HighlightWord } from '#lib';
import assert from 'assert';
import { Collection, type Snowflake } from 'discord.js';

export class HighlightManager {
	/**
	 * Cached highlights: guildId -> word -> userId
	 */
	public readonly cachedHighlights = new Collection<
		/* guild */ Snowflake,
		Collection</* word */ HighlightWord, /* users */ Set<Snowflake>>
	>();

	/**
	 * A collection of cooldowns of when a user last sent a message in a particular guild.
	 */
	public readonly userLastTalkedCooldown = new Collection<
		/* guild */ Snowflake,
		Collection</* user */ Snowflake, /* last message */ Date>
	>();

	/**
	 * Users that users have blocked
	 */
	public readonly userBlocks = new Collection<
		/* guild */ Snowflake,
		Collection</* word */ Snowflake, /* users */ Set<Snowflake>>
	>();

	/**
	 * A collection of cooldowns of when the bot last sent each user a highlight message.
	 */
	public readonly lastedDMedUserCooldown = new Collection</* user */ Snowflake, /* last dm */ Date>();

	/**
	 * Sync the cache with the database.
	 */
	public async syncCache(): Promise<void> {
		const highlights = await Highlight.findAll();

		this.cachedHighlights.clear();

		for (const highlight of highlights) {
			highlight.words.forEach((word) => {
				if (!this.cachedHighlights.has(highlight.guild)) this.cachedHighlights.set(highlight.guild, new Collection());
				const guildCache = this.cachedHighlights.get(highlight.guild)!;
				if (!guildCache.get(word)) guildCache.set(word, new Set());
				guildCache.get(word)!.add(highlight.user);
			});
		}
	}

	/**
	 * Checks a message for highlights.
	 * @param message The message to check.
	 * @returns A collection users mapped to the highlight matched
	 */
	public checkMessage(message: BushMessage): Collection<Snowflake, HighlightWord> {
		// even if there are multiple matches, only the first one is returned
		const ret = new Collection<Snowflake, HighlightWord>();
		if (!message.content || !message.inGuild()) return ret;
		if (!this.cachedHighlights.has(message.guildId)) return ret;

		const guildCache = this.cachedHighlights.get(message.guildId)!;

		for (const [word, users] of guildCache.entries()) {
			if (this.isMatch(message.content, word)) {
				for (const user of users) {
					if (!ret.has(user)) ret.set(user, word);
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
				return words.includes(hl.word);
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
		if (!this.cachedHighlights.has(guild)) this.cachedHighlights.set(guild, new Collection());
		const guildCache = this.cachedHighlights.get(guild)!;

		if (!guildCache.has(hl)) guildCache.set(hl, new Set());
		guildCache.get(hl)!.add(user);

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		if (highlight.words.some((w) => w.word === hl.word)) return `You have already highlighted "${hl.word}".`;

		highlight.words = util.addToArray(highlight.words, hl);

		return !!(await highlight.save().catch(() => false));
	}

	/**
	 * Removes a highlighted word for a user in a particular guild.
	 * @param guild The guild to remove the highlight from.
	 * @param user The user to remove the highlight from.
	 * @param hl The word to remove.
	 * @returns A string representing a user error or a boolean indicating the database success.
	 */
	public async removeHighlight(guild: Snowflake, user: Snowflake, hl: string): Promise<string | boolean> {
		if (!this.cachedHighlights.has(guild)) this.cachedHighlights.set(guild, new Collection());
		const guildCache = this.cachedHighlights.get(guild)!;

		const wordCache = guildCache.find((_, key) => key.word === hl);

		if (!wordCache?.has(user)) return `You have not highlighted "${hl}".`;

		wordCache!.delete(user);

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		const toRemove = highlight.words.find((w) => w.word === hl);
		if (!toRemove) return `Uhhhhh... This shouldn't happen.`;

		highlight.words = util.removeFromArray(highlight.words, toRemove);

		return !!(await highlight.save().catch(() => false));
	}

	/**
	 * Remove all highlight words for a user in a particular guild.
	 * @param guild The guild to remove the highlights from.
	 * @param user The user to remove the highlights from.
	 * @returns A boolean indicating the database success.
	 */
	public async removeAllHighlights(guild: Snowflake, user: Snowflake): Promise<boolean> {
		if (!this.cachedHighlights.has(guild)) this.cachedHighlights.set(guild, new Collection());
		const guildCache = this.cachedHighlights.get(guild)!;

		for (const [word, users] of guildCache.entries()) {
			if (users.has(user)) users.delete(user);
			if (!users.size) guildCache.delete(word);
		}

		const [highlight] = await Highlight.findOrCreate({ where: { guild, user } });

		highlight.words = [];

		return !!(await highlight.save().catch(() => false));
	}

	public async notify(message: BushMessage, user: Snowflake, hl: HighlightWord): Promise<boolean> {
		assert(message.inGuild());
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
			.then(() => true)
			.catch(() => false);
	}
}
