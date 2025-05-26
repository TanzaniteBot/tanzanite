import { AllIntegrationTypes, AllInteractionContexts } from '#lib';
import { ContextMenuCommand } from '@tanzanite/discord-akairo';
import type { APIMessageApplicationCommandInteraction } from 'discord-api-types/v10';
import {
	ApplicationCommandType,
	Client,
	InteractionResponseType,
	makeURLSearchParams,
	MessageContextMenuCommandInteraction,
	MessageFlags,
	Routes,
	type APIInteractionResponseDeferredChannelMessageWithSource,
	type RESTPatchAPIWebhookWithTokenMessageJSONBody
} from 'discord.js';
import { getRawData } from '../../commands/utilities/viewRaw.js';

export default class ViewRawContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('viewRaw', {
			name: 'View Raw',
			type: ApplicationCommandType.Message,
			category: 'message',
			contexts: AllInteractionContexts,
			integrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(_interaction: MessageContextMenuCommandInteraction) {
		// handled by ws listener
	}

	public static async handle(client: Client, interaction: APIMessageApplicationCommandInteraction) {
		await client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
			body: {
				type: InteractionResponseType.DeferredChannelMessageWithSource,
				data: {
					flags: MessageFlags.Ephemeral
				}
			} satisfies APIInteractionResponseDeferredChannelMessageWithSource,
			auth: false,
			query: makeURLSearchParams({ with_response: false })
		});

		const { messages } = interaction.data.resolved;

		const message = messages[interaction.data.target_id];

		const embed = (await getRawData(client, message, true)).toJSON();

		return await client.rest.patch(Routes.webhookMessage(client.user!.id, interaction.token, '@original'), {
			body: {
				embeds: [embed]
			} satisfies RESTPatchAPIWebhookWithTokenMessageJSONBody,
			auth: false
		});
	}
}
