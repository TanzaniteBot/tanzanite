import { BushListener, BushUser, Moderation, ModLog, PunishmentTypePresent } from '#lib';
import assert from 'assert';
import { TextInputStyle } from 'discord-api-types-next/v9';
import {
	APIBaseInteraction,
	APIEmbed,
	APIInteraction as DiscordAPITypesAPIInteraction,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponseDeferredMessageUpdate,
	APIInteractionResponseUpdateMessage,
	APIModalInteractionResponse,
	APIModalSubmission,
	ButtonStyle,
	ComponentType,
	GatewayDispatchEvents,
	InteractionResponseType,
	InteractionType,
	Routes
} from 'discord-api-types/v9';
import { ActionRow, ButtonComponent, Embed, Snowflake } from 'discord.js';

// todo: use from discord-api-types once updated
export type APIModalSubmitInteraction = APIBaseInteraction<InteractionType.ModalSubmit, APIModalSubmission> &
	Required<Pick<APIBaseInteraction<InteractionType.ModalSubmit, APIModalSubmission>, 'data'>>;

export type APIInteraction = DiscordAPITypesAPIInteraction | APIModalSubmitInteraction;

export default class WsInteractionCreateListener extends BushListener {
	public constructor() {
		super('wsInteractionCreate', {
			emitter: 'ws',
			event: GatewayDispatchEvents.InteractionCreate,
			category: 'ws'
		});
	}

	public override async exec(interaction: APIInteraction) {
		console.dir(interaction);

		const respond = (
			options:
				| APIModalInteractionResponse
				| APIInteractionResponseDeferredMessageUpdate
				| APIInteractionResponseChannelMessageWithSource
				| APIInteractionResponseUpdateMessage
		) => {
			return this.client.rest.post(
				Routes.interactionCallback(interaction.id, interaction.token),
				options ? { body: options } : undefined
			);
		};

		const deferredMessageUpdate = () => {
			return respond({
				type: InteractionResponseType.DeferredMessageUpdate
			});
		};

		if (interaction.type === InteractionType.MessageComponent) {
			if (interaction.data.custom_id.startsWith('appeal;')) {
				const [, punishment, guildId, userId, modlogCase] = interaction.data.custom_id.split(';') as [
					'appeal',
					PunishmentTypePresent,
					Snowflake,
					Snowflake,
					string
				];

				const guild = client.guilds.resolve(guildId);
				if (!guild)
					return respond({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `${util.emojis.error} I am no longer in that server.`
						}
					});

				const modal: APIModalInteractionResponse = {
					type: InteractionResponseType.Modal,
					data: {
						custom_id: `appeal_submit;${punishment};${guildId};${userId};${modlogCase}`,
						title: `${util.capitalize(punishment)} Appeal`,
						components: [
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										style: TextInputStyle.Paragraph,
										max_length: 1024,
										required: true,
										label: `Why were you ${Moderation.punishmentToPastTense(punishment)}?`,
										placeholder: `Why do you think you received a ${punishment}?`,
										custom_id: 'appeal_reason'
									}
								]
							},
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										style: TextInputStyle.Paragraph,
										max_length: 1024,
										required: true,
										label: 'Do you believe it was fair?',
										placeholder: `Why do you think you received a ${punishment}?`,
										custom_id: 'appeal_fair'
									}
								]
							},
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										style: TextInputStyle.Paragraph,
										max_length: 1024,
										required: true,
										label: `Why should your ${punishment} be removed?`,
										placeholder: `Why should your ${punishment} be removed?`,
										custom_id: 'appeal_why'
									}
								]
							}
						]
					}
				};

				return respond(modal);
			} else if (
				interaction.data.custom_id.startsWith('appeal_accept;') ||
				interaction.data.custom_id.startsWith('appeal_deny;')
			) {
				const [action, punishment, guildId, userId, modlogCase] = interaction.data.custom_id.split(';') as [
					'appeal_accept' | 'appeal_deny',
					PunishmentTypePresent,
					Snowflake,
					Snowflake,
					string
				];

				if (action === 'appeal_deny') {
					await client.users
						.send(userId, `Your ${punishment} appeal has been denied in ${client.guilds.resolve(guildId)!}.`)
						.catch(() => {});

					void respond({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							components: [
								{
									type: 1,
									components: [
										{
											type: ComponentType.Button,
											style: ButtonStyle.Danger,
											label: 'Close',
											custom_id: 'appeal_denied'
										}
									]
								}
							]
						}
					});
				}
			}
		} else if (interaction.type === InteractionType.ModalSubmit) {
			if (interaction.data.custom_id.startsWith('appeal_submit;')) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const [, punishment, guildId, userId, modlogCase] = interaction.data.custom_id.split(';') as [
					'appeal_submit',
					PunishmentTypePresent,
					Snowflake,
					Snowflake,
					string
				];

				const guild = client.guilds.resolve(guildId);
				if (!guild)
					return respond({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `${util.emojis.error} I am no longer in that server.`
						}
					});

				const channel = await guild.getLogChannel('appeals');
				if (!channel)
					return respond({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `${util.emojis.error} ${guild.name} has misconfigured their appeals channel.`
						}
					});

				assert(interaction.user);
				const user = new BushUser(client, interaction.user as any);
				assert(user);

				const caseId = await ModLog.findOne({ where: { user: userId, guild: guildId, id: modlogCase } });

				const embed = new Embed()
					.setTitle(`${util.capitalize(punishment)} Appeal`)
					.setColor(util.colors.newBlurple)
					.setTimestamp()
					.setFooter({ text: `CaseID: ${modlogCase}` })
					.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
					.addField({
						name: `Why were you ${Moderation.punishmentToPastTense(punishment)}?`,
						value: interaction.data.components![0].components[0]!.value.substring(0, 1024)
					})
					.addField({
						name: 'Do you believe it was fair?',
						value: interaction.data.components![1].components[0]!.value.substring(0, 1024)
					})
					.addField({
						name: `Why should your ${punishment} be removed?`,
						value: interaction.data.components![2].components[0]!.value.substring(0, 1024)
					})
					.toJSON() as APIEmbed;

				const components = [
					new ActionRow({
						type: 1,
						components: [
							new ButtonComponent({
								type: 2,
								custom_id: `appeal_accept;${punishment};${guildId};${userId};${modlogCase}`,
								label: 'Accept',
								style: 3 /* Success */
							}).toJSON(),
							new ButtonComponent({
								type: 2,
								custom_id: `appeal_deny;${punishment};${guildId};${userId};${modlogCase}`,
								label: 'Deny',
								style: 4 /* Danger */
							}).toJSON()
						]
					})
				];

				await channel.send({ embeds: [embed], components });
			} else {
				return deferredMessageUpdate();
			}
		}
	}
}
