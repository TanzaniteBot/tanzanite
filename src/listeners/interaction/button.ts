import {
	BotListener,
	Emitter,
	Moderation,
	TanzaniteEvent,
	banResponse,
	emojis,
	formatBanResponseId,
	handleAppealAttempt,
	handleAppealDecision,
	handleAutomodInteraction,
	handleButtonTicketCloseReason,
	handleButtonTicketCreatePrompt,
	handleButtonTicketCreateReason,
	handledComponents,
	type BotClientEvents
} from '#lib';
import {
	ButtonInteraction,
	ComponentType,
	GuildMember,
	MessageFlags,
	TextInputStyle,
	type ActionRowData,
	type Message,
	type ModalActionRowComponentData,
	type TextInputComponentData
} from 'discord.js';
import { AUTO_BAN_REASON } from '../bush/autoBanJoin.js';

export default class ButtonListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.Button, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.Button
		});
	}

	public async exec(...[interaction]: BotClientEvents[TanzaniteEvent.Button]) {
		const { customId } = interaction;

		if (customId.startsWith('automod;')) {
			return void handleAutomodInteraction(interaction);
		} else if (customId.startsWith('automod-prompt;')) {
			return void this.handleNameAutomodPrompt(interaction);
		} else if (customId.startsWith('automod-prompt-dismiss;')) {
			return void this.handleNameAutomodPromptDismiss(interaction);
		} else if (customId.startsWith('button-role;')) {
			return void this.handleButtonRoles(interaction);
		} else if (customId === 'test;modal') {
			return this.handleTestModal(interaction);
		} else if (customId.startsWith('test;lots;') || customId.startsWith('test;button;')) {
			return await interaction.reply({
				content: 'Buttons go brrr',
				flags: MessageFlags.Ephemeral
			});
		} else if (customId.startsWith('appeal_attempt;')) {
			return handleAppealAttempt(interaction);
		} else if (customId.startsWith('appeal_accept;') || customId.startsWith('appeal_deny;')) {
			return handleAppealDecision(interaction);
		} else if (customId.startsWith('button-ticket;create-prompt;')) {
			return handleButtonTicketCreatePrompt(interaction);
		} else if (customId.startsWith('button-ticket;create-reason;')) {
			return handleButtonTicketCreateReason(interaction);
		} else if (customId.startsWith('button-ticket;close-reason;')) {
			return handleButtonTicketCloseReason(interaction);
		}
	}

	private async handleNameAutomodPrompt(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) return;

		const [, userId] = interaction.customId.split(';');

		const victim = await interaction.guild!.members.fetch(userId).catch(() => null);
		const moderator =
			interaction.member instanceof GuildMember
				? interaction.member
				: await interaction.guild!.members.fetch(interaction.user.id);

		if (!interaction.guild?.members.me?.permissions.has('BanMembers')) {
			return interaction.reply({
				content: `${emojis.error} I do not have permission to ban members.`,
				flags: MessageFlags.Ephemeral
			});
		}

		const check = victim ? await Moderation.permissionCheck(moderator, victim, Moderation.Action.Ban, true) : true;
		if (check !== true) return interaction.reply({ content: check, flags: MessageFlags.Ephemeral });

		const result = await interaction.guild?.customBan({
			user: userId,
			reason: AUTO_BAN_REASON,
			moderator: interaction.user.id,
			evidence: (interaction.message as Message).url ?? undefined
		});

		const success = result === banResponse.Success || result === banResponse.DmError;

		if (success) {
			await interaction.update({
				components: handledComponents('ban', moderator.user.tag)
			});
		}

		return interaction.reply({
			content: await formatBanResponseId(interaction.client, userId, result),
			flags: MessageFlags.Ephemeral
		});
	}

	private async handleNameAutomodPromptDismiss(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) return;

		if (!interaction.memberPermissions.has('BanMembers')) {
			return interaction.reply({
				content: `${emojis.error} You must have **Ban Members** permission to dismiss this prompt.`,
				flags: MessageFlags.Ephemeral
			});
		}

		return interaction.update({
			components: handledComponents('dismiss', interaction.user.tag)
		});
	}

	private async handleButtonRoles(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) return;

		const [, roleId] = interaction.customId.split(';');
		const role = interaction.guild.roles.cache.get(roleId);
		if (!role) {
			return interaction.reply({
				content: `${emojis.error} That role does not exist.`,
				flags: MessageFlags.Ephemeral
			});
		}
		const has = interaction.member.roles.cache.has(roleId);
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		if (has) {
			const success = await interaction.member.roles.remove(roleId).catch(() => false);
			if (success) {
				return interaction.editReply({
					content: `${emojis.success} Removed the ${role} role from you.`,
					allowedMentions: {}
				});
			} else {
				return interaction.editReply({
					content: `${emojis.error} Failed to remove ${role} from you.`,
					allowedMentions: {}
				});
			}
		} else {
			const success = await interaction.member.roles.add(roleId).catch(() => false);
			if (success) {
				return interaction.editReply({
					content: `${emojis.success} Added the ${role} role to you.`,
					allowedMentions: {}
				});
			} else {
				return interaction.editReply({
					content: `${emojis.error} Failed to add ${role} to you.`,
					allowedMentions: {}
				});
			}
		}
	}

	private async handleTestModal(interaction: ButtonInteraction) {
		const shortText = (
			options: Pick<TextInputComponentData, 'customId' | 'label' | 'placeholder'> & Partial<TextInputComponentData>
		): ActionRowData<ModalActionRowComponentData> => ({
			type: ComponentType.ActionRow as const,
			components: [
				{
					type: ComponentType.TextInput as const,
					style: TextInputStyle.Short as const,
					...options
				}
			]
		});

		return interaction.showModal({
			customId: 'test;login',
			title: 'Login (real)',
			components: [
				shortText({
					customId: 'test;login;email',
					label: 'Email',
					placeholder: 'Email'
				}),
				shortText({
					customId: 'test;login;password',
					label: 'Password',
					placeholder: 'Password'
				}),
				shortText({
					customId: 'test;login;2fa',
					label: 'Enter Discord Auth Code',
					minLength: 6,
					maxLength: 6,
					placeholder: '6-digit authentication code'
				})
			]
		});
	}
}
