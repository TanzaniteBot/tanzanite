import { BotListener, Emitter, isInDebugMode } from '#lib';
import ViewRawContextMenuCommand from '#src/context-menu-commands/message/viewRaw.js';
import {
	ApplicationCommandType,
	GatewayDispatchEvents,
	InteractionType,
	WebSocketShardEvents,
	type APIInteraction,
	type APIMessageApplicationCommandInteraction,
	type GatewayDispatchPayload
} from 'discord.js';

export default class WsDispatchListener extends BotListener {
	public constructor() {
		super('wsDispatch', {
			emitter: Emitter.Ws,
			event: WebSocketShardEvents.Dispatch
		});
	}

	public exec(data: GatewayDispatchPayload, shardId: number) {
		switch (data.t) {
			case GatewayDispatchEvents.InteractionCreate:
				this.interactionCreate(data.d);
				break;
		}
	}

	private interactionCreate(interaction: APIInteraction) {
		if (isInDebugMode()) {
			this.client.logger.superVerboseRaw('ws', 'interactionCreate', interaction);
		}

		if (interaction.type === InteractionType.ApplicationCommand) {
			if (interaction.data.type === ApplicationCommandType.Message) {
				switch (interaction.data.name) {
					case new ViewRawContextMenuCommand().name:
						void ViewRawContextMenuCommand.handle(this.client, interaction as APIMessageApplicationCommandInteraction);
						break;
				}
			}
		}
	}
}
