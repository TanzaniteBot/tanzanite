import { BushListener, BushMessage } from '@lib';
import { MessageEmbed, TextChannel } from 'discord.js';
import _badLinks from '../../lib/badlinks.json'; // Stolen from https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/scamlinks.json
import badWords from '../../lib/badwords.json';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class AutomodMessageCreateListener extends BushListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	async exec(...[message]: BushClientEvents['messageCreate']): Promise<unknown> {
		return await AutomodMessageCreateListener.automod(message);
	}

	public static async automod(message: BushMessage): Promise<unknown> {
		if (message.guild?.id !== client.consts.mappings.guilds.bush) return; // just temporary
		/* await message.guild.getSetting('autoModPhases'); */
		const badLinks = {};
		_badLinks.forEach((link) => {
			badLinks[link] = 3;
		});

		const wordMap = { ...badWords, ...badLinks };
		const wordKeys = Object.keys(wordMap);
		const offences: { [key: string]: number } = {};

		const cleanMessageContent = message.content?.toLowerCase().replace(/ /g, '');
		wordKeys.forEach((word) => {
			const cleanWord = word.toLowerCase().replace(/ /g, '');

			if (cleanMessageContent.includes(cleanWord)) {
				if (!offences[word]) offences[word] = wordMap[word];
			}
		});
		if (!Object.keys(offences)?.length) return;

		const highestOffence = Object.values(offences).sort((a, b) => b - a)[0];

		switch (highestOffence) {
			case 0: {
				void message.delete().catch(() => {});
				break;
			}
			case 1: {
				void message.delete().catch(() => {});
				void message.member.warn({
					moderator: message.guild.me,
					reason: 'Saying a blacklisted word.'
				});
				break;
			}
			case 2: {
				void message.delete().catch(() => {});
				void message.member.mute({
					moderator: message.guild.me,
					reason: 'Saying a blacklisted word.',
					duration: 900_000 // 15 minutes
				});
				break;
			}
			case 3: {
				void message.delete().catch(() => {});
				void message.member.mute({
					moderator: message.guild.me,
					reason: 'Saying a blacklisted word.',
					duration: 0 // perm
				});
				break;
			}
		}

		const color =
			highestOffence === 0
				? util.colors.lightGray
				: highestOffence === 1
				? util.colors.yellow
				: highestOffence === 2
				? util.colors.orange
				: util.colors.red;
		void (message.guild.channels.cache.get('783088333055066212') as TextChannel).send({
			embeds: [
				new MessageEmbed()
					.setTitle(`[Severity ${highestOffence}] Automod Action Performed`)
					.setDescription(
						`**User:** ${message.author} (${message.author.tag})\n**Blacklisted Words:** ${util
							.surroundArray(Object.keys(offences), '`')
							.join()}`
					)
					.addField('Message Content', `${util.codeblock(message.content, 1024)}`)
					.setColor(color)
					.setTimestamp()
			]
		});
	}
}
