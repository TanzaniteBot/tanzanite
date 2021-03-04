import { APIInteractionResponseType, InteractionType } from 'discord-api-types';
import got from 'got';
import { BotListener } from '../../extensions/BotListener';
import { SlashCommand } from '../../extensions/Struct';

export default class InteractionListener extends BotListener {
	constructor() {
		super('interactionCreate', {
			emitter: 'gateway',
			event: 'INTERACTION_CREATE'
		})
	}
	async exec(command: SlashCommand): Promise<void> {
		if (command == null) return
		await this.client.channels.fetch(command.channel_id).catch(() => {/*pass*/});
		if (command.type === InteractionType.Ping) {
			await got.post(`https://discord.com/api/v8/interactions/${command.id}/${command.token}/callback`, {
				body: JSON.stringify({
					type: InteractionType.Ping
				})
			})
		} else {
			await got.post(`https://discord.com/api/v8/interactions/${command.id}/${command.token}/callback`, {
				body: JSON.stringify({
					type: APIInteractionResponseType.ChannelMessageWithSource,
					data: {
						content: 'poggers'
					}
				})
			})
		}
	}
}