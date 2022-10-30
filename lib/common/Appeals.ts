import { colors, emojis } from '#lib/utils/Constants.js';
import { input } from '#lib/utils/Format.js';
import {
	formatUnbanResponse,
	formatUnblockResponse,
	formatUnmuteResponse,
	formatUntimeoutResponse
} from '#lib/utils/FormatResponse.js';
import { capitalize, ModalInput } from '#lib/utils/Utils.js';
import { AppealStatus, ModLog } from '#models';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	TextInputStyle,
	type ButtonInteraction,
	type ModalSubmitInteraction,
	type Snowflake
} from 'discord.js';
import assert from 'node:assert/strict';
import { Action, punishments } from './Moderation.js';

type AppealBase = 'appeal_attempt' | 'appeal_submit' | 'appeal_accept' | 'appeal_deny';

type RawAppealInfo = [
	baseId: AppealBase,
	punishment: `${Action}`,
	guildId: Snowflake,
	userId: Snowflake,
	modlogId: string,
	extraId?: Snowflake
];

type AppealInfo = [
	baseId: AppealBase,
	punishment: Action,
	guildId: Snowflake,
	userId: Snowflake,
	modlogId: string,
	extraId?: Snowflake
];

export type AppealIdString =
	`${RawAppealInfo[0]};${RawAppealInfo[1]};${RawAppealInfo[2]};${RawAppealInfo[3]};${RawAppealInfo[4]}${RawAppealInfo[5] extends undefined
		? ''
		: `;${RawAppealInfo[5]}`}`;

function parseAppeal(customId: AppealIdString | string): AppealInfo {
	const [baseId, _punishment, guildId, userId, modlogId] = customId.split(';') as RawAppealInfo;

	const punishment = Action[Action[_punishment] as keyof typeof Action];

	return [baseId, punishment, guildId, userId, modlogId];
}

/**
 * Handles when a user clicks the "Appeal Punishment" button on a punishment dm.
 * @param interaction A button interaction with a custom id thar starts with "appeal_attempt;".
 */
export async function handleAppealAttempt(interaction: ButtonInteraction) {
	const [baseId, punishment, guildId, userId, modlogId, extraId] = parseAppeal(interaction.customId);

	const { base, past, appealCustom } = punishments[punishment];
	const appealName = appealCustom ?? capitalize(base);

	const guild = interaction.client.guilds.resolve(guildId);
	if (!guild) {
		return await interaction.reply(`${emojis.error} I am no longer in that server.`);
	}

	const modlog = await ModLog.findByPk(modlogId);
	if (!modlog) {
		return await interaction.reply(`:skull: I cannot find the modlog ${input(modlogId)}. Please report this to my developers.`);
	}

	switch (modlog.appeal) {
		case AppealStatus.Accepted:
			return await interaction.reply(
				`${emojis.error} Your punishment (${input(modlogId)}) has already been appealed and accepted.`
			);
		case AppealStatus.Denied:
			return await interaction.reply(
				`${emojis.error} Your punishment (${input(modlogId)}) has already been appealed and denied.`
			);
		case AppealStatus.Submitted:
			return await interaction.reply(
				`${emojis.error} Your punishment (${input(
					modlogId
				)}) has already been appealed, please be patient for a moderator to review your appeal.`
			);
		default: {
			const _exhaustiveCheck: AppealStatus.None = modlog.appeal;
		}
	}

	const baseInput = {
		style: TextInputStyle.Paragraph,
		required: true,
		maxLength: 1024
	};

	return await interaction.showModal({
		customId: `appeal_submit;${punishment};${guildId};${userId};${modlogId}${extraId ? `;${extraId}` : ''}`,
		title: `${appealName} Appeal`,
		components: [
			ModalInput({
				...baseInput,
				label: `Why were you ${past}?`,
				placeholder: `Why do you think you received a ${base}?`,
				customId: 'appeal_reason'
			}),
			ModalInput({
				...baseInput,
				label: 'Do you believe it was fair?',
				placeholder: `Do you think that your ${base} is fair?`,
				customId: 'appeal_fair'
			}),
			ModalInput({
				...baseInput,
				label: `Why should your ${base} be removed?`,
				placeholder: `Why do you think your ${base} be removed?`,
				customId: 'appeal_why'
			})
		]
	});
}

/**
 * Handles when a user submits the modal for appealing a punishment.
 * @param interaction A modal interaction with a custom id that starts with "appeal_submit;".
 */
export async function handleAppealSubmit(interaction: ModalSubmitInteraction) {
	const [baseId, punishment, guildId, userId, modlogId, extraId] = parseAppeal(interaction.customId);

	const { base, past, appealCustom } = punishments[punishment];
	const appealName = appealCustom ?? capitalize(base);

	const guild = interaction.client.guilds.resolve(guildId);
	if (!guild) {
		return await interaction.reply(`${emojis.error} I am no longer in that server.`);
	}

	const modlog = await ModLog.findByPk(modlogId);
	if (!modlog) {
		return await interaction.reply(`:skull: I cannot find the modlog ${input(modlogId)}. Please report this to my developers.`);
	}

	if (modlog.appeal !== AppealStatus.None) {
		return await interaction.reply(`Invalid appeal status: ${modlog.appeal}`);
	}

	modlog.appeal = AppealStatus.Submitted;
	await modlog.save();

	const appealChannel = await guild.getLogChannel('appeals');
	if (!appealChannel) {
		return await interaction.reply(`${emojis.error} I could not find an appeals channel in this server.`);
	}

	const user = await interaction.client.users.fetch(userId);

	const reason = interaction.fields.getTextInputValue('appeal_reason');
	const fair = interaction.fields.getTextInputValue('appeal_fair');
	const why = interaction.fields.getTextInputValue('appeal_why');

	const embed = new EmbedBuilder()
		.setTitle(`${appealName} Appeal`)
		.setColor(colors.newBlurple)
		.setTimestamp()
		.setFooter({ text: `CaseID: ${modlogId}` })
		.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
		.addFields(
			{ name: `Why were you ${past}?`, value: reason },
			{ name: 'Do you believe it was fair?', value: fair },
			{ name: `Why should your ${base} be removed?`, value: why }
		);
	return await appealChannel.send({
		content: `Appeal submitted by ${user.tag} (${user.id})`,
		embeds: [embed],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder({
					customId: `appeal_accept;${punishment};${guildId};${userId};${modlogId}${extraId ? `;${extraId}` : ''}`,
					label: 'Accept Appeal',
					style: ButtonStyle.Success
				}),
				new ButtonBuilder({
					customId: `appeal_deny;${punishment};${guildId};${userId};${modlogId}${extraId ? `;${extraId}` : ''}`,
					label: 'Deny Appeal',
					style: ButtonStyle.Danger
				})
			)
		]
	});
}

/**
 * Handles interactions when a moderator clicks the "Accept" or "Deny" button on a punishment appeal.
 * @param interaction A button interaction with a custom id that starts with "appeal_accept;" or "appeal_deny;".
 */
export async function handleAppealDecision(interaction: ButtonInteraction) {
	if (!interaction.inCachedGuild()) {
		void interaction.client.console.warn('Appeals', `Appeal decision made in uncached guild: ${interaction.guildId}`);
		return;
	}

	const [baseId, punishment, guildId, userId, modlogId, extraId] = parseAppeal(interaction.customId);

	const { base, past, appealCustom } = punishments[punishment];
	const appealName = (appealCustom ?? base).toLowerCase();

	const modlog = await ModLog.findByPk(modlogId);

	if (!modlog) {
		return await interaction.reply(`:boom: I cannot find the modlog ${input(modlogId)}. Please report this to my developers.`);
	}

	if (modlog.appeal !== AppealStatus.Submitted) {
		return await interaction.reply(
			`:boom: Case ${input(modlogId)} has an invalid state of ${input(modlog.appeal)}. Please report this to my developers.`
		);
	}

	if (baseId === 'appeal_deny') {
		modlog.appeal = AppealStatus.Denied;
		await modlog.save();

		await interaction.client.users
			.send(userId, `Your ${appealName} appeal has been denied in ${interaction.client.guilds.resolve(guildId)!}.`)
			.catch(() => {});

		return await interaction.update({
			content: `${emojis.cross} Appeal denied.`,
			embeds: interaction.message.embeds,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder({
						disabled: true,
						style: ButtonStyle.Danger,
						label: 'Appeal Denied',
						custom_id: 'noop'
					})
				)
			]
		});
	} else if (baseId === 'appeal_accept') {
		const guild = interaction.client.guilds.resolve(guildId);
		if (!guild) return await interaction.reply(`:boom: I can't find this server.`);

		switch (punishment) {
			case Action.Warn:
			case Action.Unmute:
			case Action.Kick:
			case Action.Unban:
			case Action.Untimeout:
			case Action.Unblock:
			case Action.RemovePunishRole:
				assert.fail(`Cannot appeal ${appealName} (Action.${Action[punishment]})`);
				return;
			case Action.Mute: {
				const member = await guild.members.fetch(userId);

				const res = await member.customUnmute({
					reason: `Appeal accepted.`,
					moderator: interaction.member,
					noDM: true
				});

				if (res !== 'success') {
					return await interaction.reply({
						content: formatUnmuteResponse('/', member, res),
						ephemeral: false
					});
				}

				break;
			}
			case Action.Ban: {
				const user = await interaction.client.users.fetch(userId);

				const res = await guild.customUnban({
					user: userId,
					reason: `Appeal accepted.`,
					moderator: interaction.member,
					noDM: true
				});

				if (res !== 'success') {
					return await interaction.reply({
						content: formatUnbanResponse(user, res),
						ephemeral: false
					});
				}

				break;
			}
			case Action.Timeout: {
				const member = await guild.members.fetch(userId);

				const res = await member.customRemoveTimeout({
					reason: `Appeal accepted.`,
					moderator: interaction.member,
					noDM: true
				});

				if (res !== 'success') {
					return await interaction.reply({
						content: formatUntimeoutResponse(member, res),
						ephemeral: false
					});
				}

				break;
			}
			case Action.Block: {
				assert(extraId, 'Block appeal must have extraId');
				const member = await guild.members.fetch(userId);

				const res = await member.customUnblock({
					reason: `Appeal accepted.`,
					channel: extraId,
					moderator: interaction.member,
					noDM: true
				});

				if (res !== 'success') {
					return await interaction.reply({
						content: formatUnblockResponse(member, res),
						ephemeral: false
					});
				}

				break;
			}
			case Action.AddPunishRole: {
				throw new Error('Not implemented');

				break;
			}
			default: {
				const _exhaustiveCheck: never = punishment;
			}
		}

		modlog.appeal = AppealStatus.Accepted;
		await modlog.save();

		// dm
		await interaction.client.users
			.send(userId, `Your ${appealName} appeal (${input(modlogId)}) has been accepted in ${guild}.`)
			.catch(() => {});

		return await interaction.update({
			content: `${emojis.check} Appeal accepted.`,
			embeds: interaction.message.embeds,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder({
						disabled: true,
						style: ButtonStyle.Success,
						label: 'Appeal Accepted',
						custom_id: 'noop'
					})
				)
			]
		});
	}
}
