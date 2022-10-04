import { BotListener, Emitter } from '#lib';
import { GatewayDispatchEvents, type APIInteraction } from 'discord.js';

export default class WsInteractionCreateListener extends BotListener {
	public constructor() {
		super('wsInteractionCreate', {
			emitter: Emitter.Ws,
			event: GatewayDispatchEvents.InteractionCreate
		});
	}

	public async exec(interaction: APIInteraction) {}
}
