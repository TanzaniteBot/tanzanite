import { APIInteractionResponseType, InteractionType } from 'discord-api-types';
import { MessageEmbed } from 'discord.js';
import got from 'got';
import { BotListener } from '../../extensions/BotListener';
import { SlashCommand } from '../../extensions/Struct';
import { stripIndent } from 'common-tags';
export default class InteractionListener extends BotListener {
	async interactionRespond(command: SlashCommand, response: {type: APIInteractionResponseType; data?: {content: string}}): Promise<void> {
		const callback = await got.post(`https://discord.com/api/v8/interactions/${command.id}/${command.token}/callback`, {
			body: JSON.stringify(response),
			throwHttpErrors: false,
			headers: {
				'Content-Type': 'application/json'
			}
		})
		if (callback.statusCode.toString().match(/2\d\d/) === null) {
			const user = await this.client.users.fetch((command.user || command.member.user).id)
			this.error(new MessageEmbed({
				title: 'Slash command response error',
				description: stripIndent`
					HTTP Response Code: ${callback.statusCode}
					Slash command body: ${await this.client.consts.haste(JSON.stringify(command, null, 4))}
					JSON Response body: ${await this.client.consts.haste(JSON.stringify(JSON.parse(callback.body), null, 4))}
					User: ${user.tag} (${user.id})
				`,
				color: this.client.consts.ErrorColor
			}))
		}
	}
	constructor() {
		super('interactionCreate', {
			emitter: 'gateway',
			event: 'INTERACTION_CREATE'
		})
	}
	async exec(command: SlashCommand): Promise<void> {
		if (command == null) return
		if (command.type === InteractionType.Ping) {
			await this.interactionRespond(command, {
				type: 1
			})
		} else {
			try {
				switch (command.data.name) {
					case 'dn': {
						await this.interactionRespond(command, {
							type: APIInteractionResponseType.ChannelMessageWithSource,
							data: {
								content: 'Deez ***nuts***'
							}
						})
						return
					}
					case 'say': {
						if (this.client.ownerID.includes((command.user || command.member.user).id)) {
							await this.interactionRespond(command, {
								type: APIInteractionResponseType.ChannelMessage,
								data: {
									content: command.data.options[0].value as string
								}
							})
						} else {
							await this.interactionRespond(command, {
								type: APIInteractionResponseType.Acknowledge
							})
						}
						return
					}
					default: {
						await this.interactionRespond(command, {
							type: APIInteractionResponseType.ChannelMessageWithSource,
							data: {
								content: 'MBot slash commands are currently a mess rn, and you just found a slash command that doesn\'t have any code attached to it. gg'
							}
						})
						return
					}
				}
			} catch (e) {
				const user = await this.client.users.fetch((command.user || command.member.user).id)
				this.error(new MessageEmbed({
					title: 'Slash command response error',
					description: stripIndent`
						Error message: ${e.message}
						Error stack: ${await this.client.consts.haste(e.stack)}
						User: ${user.tag} (${user.id})
					`,
					color: this.client.consts.ErrorColor
				}))
			}

		}
	}
}
