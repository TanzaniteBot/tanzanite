import * as Moderation from '#lib/common/Moderation.js';
import { unmuteResponse } from '#lib/extensions/discord.js/ExtendedGuildMember.js';
import { colors, emojis } from '#lib/utils/Constants.js';
import { formatBanResponseId, formatUnmuteResponse } from '#lib/utils/FormatResponse.js';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	GuildMember,
	Message,
	PermissionFlagsBits,
	type BaseMessageOptions,
	type Snowflake
} from 'discord.js';
import assert from 'node:assert/strict';

/**
 * Handles shared auto moderation functionality.
 */
export abstract class Automod {
	/**
	 * Whether or not a punishment has already been given to the user
	 */
	protected punished = false;

	/**
	 * @param member The guild member that the automod is checking
	 */
	protected constructor(protected readonly member: GuildMember) {}

	/**
	 * The user
	 */
	protected get user() {
		return this.member.user;
	}

	/**
	 * The client instance
	 */
	protected get client() {
		return this.member.client;
	}

	/**
	 * The guild member that the automod is checking
	 */
	protected get guild() {
		return this.member.guild;
	}

	/**
	 * Whether or not the member should be immune to auto moderation
	 */
	protected get isImmune() {
		if (this.member.user.isOwner()) return true;
		if (this.member.guild.ownerId === this.member.id) return true;
		if (this.member.permissions.has('Administrator')) return true;

		return false;
	}

	protected buttons(userId: Snowflake, reason: string, undo = true): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder({
				style: ButtonStyle.Danger,
				label: 'Ban User',
				customId: `automod;ban;${userId};${reason}`
			})
		]);

		if (undo) {
			row.addComponents(
				new ButtonBuilder({
					style: ButtonStyle.Success,
					label: 'Unmute User',
					customId: `automod;unmute;${userId}`
				})
			);
		} else {
			row.addComponents(
				new ButtonBuilder({
					style: ButtonStyle.Secondary,
					label: 'Dismiss',
					customId: `automod;dismiss;${userId}`
				})
			);
		}

		return row;
	}

	protected logColor(severity: Severity) {
		switch (severity) {
			case Severity.DELETE:
				return colors.lightGray;
			case Severity.WARN:
				return colors.yellow;
			case Severity.TEMP_MUTE:
				return colors.orange;
			case Severity.PERM_MUTE:
				return colors.red;
		}
		throw new Error(`Unknown severity: ${severity}`);
	}

	/**
	 * Checks if any of the words provided are in the message
	 * @param words The words to check for
	 * @returns The blacklisted words found in the message
	 */
	protected checkWords(words: BadWordDetails[], str: string): BadWordDetails[] {
		if (words.length === 0) return [];

		const matchedWords: BadWordDetails[] = [];
		for (const word of words) {
			if (word.regex) {
				if (new RegExp(word.match).test(this.format(word.match, word))) {
					matchedWords.push(word);
				}
			} else {
				if (this.format(str, word).includes(this.format(word.match, word))) {
					matchedWords.push(word);
				}
			}
		}
		return matchedWords;
	}

	/**
	 * Format a string according to the word options
	 * @param string The string to format
	 * @param wordOptions The word options to format with
	 * @returns The formatted string
	 */
	protected format(string: string, wordOptions: BadWordDetails) {
		const temp = wordOptions.ignoreCapitalization ? string.toLowerCase() : string;
		return wordOptions.ignoreSpaces ? temp.replace(/ /g, '') : temp;
	}

	/**
	 * Handles the auto moderation
	 */
	protected abstract handle(): Promise<void>;
}

/**
 * Handles the ban button in the automod log.
 * @param interaction The button interaction.
 */
export async function handleAutomodInteraction(interaction: ButtonInteraction) {
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
		return interaction.reply({
			content: `${emojis.error} You are missing the **Ban Members** permission.`,
			ephemeral: true
		});
	}

	const [action, userId, reason] = interaction.customId.replace('automod;', '').split(';') as [
		'ban' | 'unmute' | 'dismiss',
		string,
		string
	];

	if (!(['ban', 'unmute', 'dismiss'] as const).includes(action)) throw new TypeError(`Invalid automod button action: ${action}`);

	const victim = await interaction.guild!.members.fetch(userId).catch(() => null);
	const moderator =
		interaction.member instanceof GuildMember ? interaction.member : await interaction.guild!.members.fetch(interaction.user.id);

	switch (action) {
		case 'ban': {
			if (!interaction.guild?.members.me?.permissions.has('BanMembers')) {
				return interaction.reply({
					content: `${emojis.error} I do not have permission to ${action} members.`,
					ephemeral: true
				});
			}

			const check = victim ? await Moderation.permissionCheck(moderator, victim, Moderation.Action.Ban, true) : true;
			if (check !== true) return interaction.reply({ content: check, ephemeral: true });

			const result = await interaction.guild?.customBan({
				user: userId,
				reason,
				moderator: interaction.user.id,
				evidence: (interaction.message as Message).url ?? undefined
			});

			const success = result === unmuteResponse.Success || result === unmuteResponse.DmError;

			if (success) {
				await interaction.update({
					components: handledComponents(action, moderator.user.tag)
				});
			}

			return interaction[success ? 'followUp' : 'reply']({
				content: await formatBanResponseId(interaction.client, userId, result),
				ephemeral: true
			});
		}

		case 'unmute': {
			if (!victim)
				return interaction.reply({
					content: `${emojis.error} Cannot find member, they may have left the server.`,
					ephemeral: true
				});

			if (!interaction.guild)
				return interaction.reply({
					content: `${emojis.error} This is weird, I don't seem to be in the server...`,
					ephemeral: true
				});

			const check = await Moderation.permissionCheck(moderator, victim, Moderation.Action.Unmute, true);
			if (check !== true) return interaction.reply({ content: check, ephemeral: true });

			const check2 = await Moderation.checkMutePermissions(interaction.guild);
			if (check2 !== true) return interaction.reply({ content: formatUnmuteResponse('/', victim, check2), ephemeral: true });

			const result = await victim.customUnmute({
				reason,
				moderator: interaction.member as GuildMember,
				evidence: (interaction.message as Message).url ?? undefined
			});

			const success = result === unmuteResponse.Success || result === unmuteResponse.DmError;

			if (success) {
				await interaction.update({
					components: handledComponents(action, moderator.user.tag)
				});
			}

			return interaction[success ? 'followUp' : 'reply']({
				content: formatUnmuteResponse('/', victim, result),
				ephemeral: true
			});
		}

		case 'dismiss': {
			// if the victim is null, still allow to dismiss
			const check = victim ? await Moderation.permissionCheck(moderator, victim, Moderation.Action.Unmute, true) : true;
			if (check !== true) return interaction.reply({ content: check, ephemeral: true });

			await interaction.update({
				components: handledComponents(action, moderator.user.tag)
			});
		}
	}
}

export function handledComponents(action: 'ban' | 'unmute' | 'dismiss', tag: string): BaseMessageOptions['components'] {
	assert(['ban', 'unmute', 'dismiss'].includes(action), `Invalid automod button action: ${action}`);

	return [
		{
			type: ComponentType.ActionRow,
			components: [
				{
					type: ComponentType.Button,
					customId: 'noop',
					label: `${{ ban: 'Banned', unmute: 'Unmuted', dismiss: 'Dismissed' }[action]} by ${tag}`,
					style: {
						ban: ButtonStyle.Danger as const,
						unmute: ButtonStyle.Success as const,
						dismiss: ButtonStyle.Secondary as const
					}[action],
					disabled: true
				}
			]
		}
	];
}

/**
 * The severity of the blacklisted word
 */
export enum Severity {
	/**
	 * Delete message
	 */
	DELETE,

	/**
	 * Delete message and warn user
	 */
	WARN,

	/**
	 * Delete message and mute user for 15 minutes
	 */
	TEMP_MUTE,

	/**
	 * Delete message and mute user permanently
	 */
	PERM_MUTE
}

/**
 * Details about a blacklisted word
 */
export interface BadWordDetails {
	/**
	 * The word that is blacklisted
	 */
	match: string;

	/**
	 * The severity of the word
	 */
	severity: Severity | 1 | 2 | 3;

	/**
	 * Whether or not to ignore spaces when checking for the word
	 */
	ignoreSpaces: boolean;

	/**
	 * Whether or not to ignore case when checking for the word
	 */
	ignoreCapitalization: boolean;

	/**
	 * The reason that this word is blacklisted (used for the punishment reason)
	 */
	reason: string;

	/**
	 * Whether or not the word is regex
	 * @default false
	 */
	regex: boolean;

	/**
	 * Whether to also check a user's status and username for the phrase
	 * @default false
	 */
	userInfo: boolean;
}

/**
 * Blacklisted words mapped to their details
 */
export interface BadWords {
	[category: string]: BadWordDetails[];
}
