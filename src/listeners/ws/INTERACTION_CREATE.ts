import { BushListener } from '#lib';
// eslint-disable-next-line node/file-extension-in-import
import { GatewayDispatchEvents, Routes } from 'discord-api-types/v9';

export default class WsInteractionCreateListener extends BushListener {
	public constructor() {
		super('wsInteractionCreate', {
			emitter: 'ws',
			event: GatewayDispatchEvents.InteractionCreate,
			category: 'ws'
		});
	}

	public override async exec(interaction: any) {
		// console.dir(interaction);

		if (interaction.type === 5) {
			await this.client.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
				body: {
					type: 6
				}
			});
		}
	}
}
