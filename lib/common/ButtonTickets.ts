import { generateRolesField } from '#lib/common/info/UserInfo.js';
import { AllowedMentions } from '#lib/utils/AllowedMentions.js';
import { colors, emojis, Time } from '#lib/utils/Constants.js';
import { input } from '#lib/utils/Format.js';
import { sleep, timestampAndDelta } from '#lib/utils/Utils.js';
import {
	ButtonStyle,
	ChannelType,
	ComponentType,
	escapeMarkdown,
	MessageFlags,
	TextInputStyle,
	ThreadAutoArchiveDuration,
	type APIEmbedField,
	type ButtonInteraction,
	type ModalMessageModalSubmitInteraction
} from 'discord.js';
import { embedField } from './tags.js';

export function handleButtonTicketCreatePrompt(interaction: ButtonInteraction) {
	const [, , ticketType] = interaction.customId.split(';');

	return interaction.reply({
		embeds: [
			{
				title: 'Ticket Creation Confirmation',
				description: `Are you sure you want to create a ${input(ticketType)} ticket?`,
				color: colors.Yellow,
				timestamp: new Date().toISOString()
			}
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Success,
						label: 'Yes, Create Ticket',
						customId: `${interaction.customId.replace(/;create-\w{4,8};/, ';create-reason;')};${Date.now()}`
					}
				]
			}
		],
		flags: MessageFlags.Ephemeral
	});
}

export async function handleButtonTicketCreateReason(interaction: ButtonInteraction) {
	const [, , ticketType] = interaction.customId.split(';');

	return interaction.showModal({
		title: 'Create Ticket',
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						label: `Reason for creating this ${ticketType} ticket`,
						style: TextInputStyle.Short,
						type: ComponentType.TextInput,
						customId: 'create-ticket-reason'
					}
				]
			}
		],
		customId: `${interaction.customId.replace(/;create-\w{4,8};/, ';create;')};${Date.now()}`
	});
}

export async function handleButtonTicketCreate(interaction: ModalMessageModalSubmitInteraction) {
	const [, , ticketType] = interaction.customId.split(';');

	const reason = interaction.fields.getTextInputValue('create-ticket-reason').trim();

	if (!interaction.inCachedGuild())
		return interaction.reply({
			content: `${emojis.error} I can only create tickets in cached guilds.`,
			flags: MessageFlags.Ephemeral
		});

	const { channel, user, member } = interaction;

	if (!channel || channel.type !== ChannelType.GuildText) {
		return interaction.reply({
			content: `${emojis.error} I can only create tickets in regular text channels.`,
			flags: MessageFlags.Ephemeral
		});
	}

	const thread = await channel.threads.create({
		name: `[${ticketType}] ${interaction.user.username}${
			interaction.user.discriminator === '0' ? '' : `＃${interaction.user.discriminator}`
		}`,
		type: ChannelType.PrivateThread,
		invitable: false,
		reason: `Ticket created by ${interaction.user.tag} (${interaction.user.id})`,
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
	});

	const pronouns = await Promise.race([
		user.client.utils.getPronounsOf(user),
		// cut off request after 2 seconds
		sleep(2 * Time.Second)
	]);

	const roles = (await thread.guild.getSetting('ticketThreadAddRoles')) ?? [];

	await thread.send({
		// only ping roles if the ticket creator doesn't have the roles
		content: roles.length && !member.roles.cache.hasAll(...roles) ? `${roles.map((role) => `<@&${role}>`).join(' ')}` : undefined,
		embeds: [
			{
				title: 'Ticket Information',
				color: colors.default,
				fields: [
					{
						name: '» Subject',
						value: embedField`
							Category ${escapeMarkdown(ticketType)}
							Reason ${escapeMarkdown(reason || 'No subject provided')}`
					},
					{
						name: '» User Information',
						value: embedField`
							Mention ${`<@${user.id}>`}
							Created ${timestampAndDelta(user.createdAt, 'd')}
							Joined ${member.joinedAt && timestampAndDelta(member.joinedAt, 'd')}
							Nickname ${member.nickname && escapeMarkdown(member.nickname)}
							Pronouns ${typeof pronouns === 'string' && pronouns !== 'Unspecified' && pronouns}`
					},
					generateRolesField(member)
				].filter((f) => f != null) as APIEmbedField[],
				timestamp: new Date().toISOString(),
				footer: {
					text: user.id
				}
			}
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Danger,
						label: 'Close Ticket',
						customId: `button-ticket;close-reason;${user.id};${Date.now()}`
					}
				]
			}
		],
		allowedMentions: { roles: roles, users: [], repliedUser: false }
	});

	await thread.members.add(interaction.user);

	return interaction.reply({
		content: `${emojis.success} You ticket has been created in ${thread}.`,
		flags: MessageFlags.Ephemeral
	});
}

export async function handleButtonTicketCloseReason(interaction: ButtonInteraction) {
	const [, , userId] = interaction.customId.split(';');

	if (!interaction.inCachedGuild()) {
		return interaction.reply({
			content: `${emojis.error} I can only close tickets in cached guilds.`,
			flags: MessageFlags.Ephemeral
		});
	}

	const { channel: thread, user, member } = interaction;

	if (user.id !== userId && !member.permissions.has('ManageMessages')) {
		return interaction.reply({
			content: `${emojis.error} Only moderators and the original ticket creator can close tickets.`,
			flags: MessageFlags.Ephemeral
		});
	}

	if (thread?.type !== ChannelType.PrivateThread) {
		return interaction.reply({
			content: `${emojis.error} I can only close tickets in private thread channels.`,
			flags: MessageFlags.Ephemeral
		});
	}

	if (thread.locked) {
		return interaction.reply({
			content: `${emojis.error} This ticket is already closed.`,
			flags: MessageFlags.Ephemeral
		});
	}

	return interaction.showModal({
		title: 'Close Ticket',
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						label: 'Reason for closing the ticket',
						style: TextInputStyle.Short,
						type: ComponentType.TextInput,
						customId: 'close-ticket-reason'
					}
				]
			}
		],
		customId: interaction.customId.replace(/;close-\w{4,8};/, ';close;')
	});
}

export async function handleButtonTicketClose(interaction: ModalMessageModalSubmitInteraction) {
	const [, , userId] = interaction.customId.split(';');

	if (!interaction.inCachedGuild()) return interaction.reply(`${emojis.error} How did you get this modal?`);

	const reason = interaction.fields.getTextInputValue('close-ticket-reason').trim();

	const { channel: thread, user, member } = interaction;

	// this should have already have been checked
	if (
		(user.id !== userId && !member.permissions.has('ManageMessages')) ||
		thread?.type !== ChannelType.PrivateThread ||
		thread.locked
	)
		return interaction.reply(`${emojis.error} How did you get this modal?`);

	await interaction.reply({
		content: `${emojis.success} This ticket has been closed by ${user.tag} (${user.id})`,
		allowedMentions: AllowedMentions.none()
	});

	await thread.edit({
		archived: true,
		locked: true,
		name: `${thread.name} (Closed)`,
		reason: `Ticket closed by ${user.tag} (${user.id})${reason ? ` for reason: ${reason}` : ''}`
	});
}
