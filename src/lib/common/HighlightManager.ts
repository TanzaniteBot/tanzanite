import { Highlight, type BushMessage, type HighlightWord } from '#lib';
import type { Snowflake } from 'discord.js';

export class HighlightManager {
	public cachedHighlights: Map</* guild */ Snowflake, Map</* word */ HighlightWord, /* users */ Set<Snowflake>>> = new Map();
	public userLastTalkedCooldown = new Map<Snowflake, Map<Snowflake, Date>>();
	public lastedDMedUserCooldown = new Map</* user */ Snowflake, /* last dm */ Date>();

	public async syncCache() {
		const highlights = await Highlight.findAll();

		this.cachedHighlights.clear();

		for (const highlight of highlights) {
			highlight.words.forEach((word) => {
				if (!this.cachedHighlights.has(highlight.guild)) this.cachedHighlights.set(highlight.guild, new Map());
				const guildCache = this.cachedHighlights.get(highlight.guild)!;
				if (!guildCache.get(word)) guildCache.set(word, new Set());
				guildCache.get(word)!.add(highlight.user);
			});
		}
	}

	public checkMessage(message: BushMessage): Map<Snowflake, string> {
		// even if there are multiple matches, only the first one is returned
		const ret = new Map<Snowflake, string>();
		if (!message.content || !message.inGuild()) return ret;
		if (!this.cachedHighlights.has(message.guildId)) return ret;

		const guildCache = this.cachedHighlights.get(message.guildId)!;

		for (const [word, users] of guildCache.entries()) {
			if (this.isMatch(message.content, word)) {
				for (const user of users) {
					if (!ret.has(user)) ret.set(user, word.word);
				}
			}
		}

		return ret;
	}

	public async checkPhraseForUser(guild: Snowflake, user: Snowflake, phrase: string): Promise<Map<string, boolean>> {
		const highlights = await Highlight.findAll({ where: { guild, user } });

		const results = new Map<string, boolean>();

		for (const highlight of highlights) {
			for (const word of highlight.words) {
				if (this.isMatch(phrase, word)) {
					results.set(word.word, true);
				}
			}
		}

		return results;
	}

	private isMatch(phrase: string, word: HighlightWord) {
		if (word.regex) {
			return new RegExp(word.word, 'gi').test(phrase);
		} else {
			if (word.word.includes(' ')) {
				return phrase.includes(word.word);
			} else {
				const words = phrase.split(/\s*\b\s/);
				return words.includes(word.word);
			}
		}
	}
}
