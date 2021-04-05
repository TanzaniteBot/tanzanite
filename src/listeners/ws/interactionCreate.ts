import { APIInteractionResponseType, InteractionType } from 'discord-api-types';
import { MessageEmbed } from 'discord.js';
import got from 'got';
import { BushListener } from '../../lib/extensions/BushListener';
import { SlashCommand } from '../../lib/utils/Struct';
import { stripIndent } from 'common-tags';
import * as botoptions from '../../config/botoptions';
import log from '../../lib/utils/log';
import db from '../../constants/db';

export default class InteractionListener extends BushListener {
	async interactionRespond(
		command: SlashCommand,
		response: { type: APIInteractionResponseType; data?: { content: string } }
	): Promise<void> {
		const callback = await got.post(
			`https://discord.com/api/v8/interactions/${command.id}/${command.token}/callback`,
			{
				body: JSON.stringify(response),
				throwHttpErrors: false,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
		if (callback.statusCode.toString().match(/2\d\d/) === null) {
			const user = await this.client.users.fetch(
				(command.user || command.member.user).id
			);
			this.error(
				new MessageEmbed({
					title: 'Slash command response error',
					description: stripIndent`
					HTTP Response Code: ${callback.statusCode}
					Slash command body: ${await this.client.consts.haste(
						JSON.stringify(command, null, 4)
					)}
					JSON Response body: ${await this.client.consts.haste(
						JSON.stringify(JSON.parse(callback.body), null, 4)
					)}
					User: ${user.tag} (${user.id})
				`,
					color: this.client.consts.ErrorColor
				})
			);
		}
	}
	constructor() {
		super('interactionCreate', {
			emitter: 'gateway',
			event: 'INTERACTION_CREATE'
		});
	}
	async exec(command: SlashCommand): Promise<void> {
		if (command == null) return;
		if (command.type === InteractionType.Ping) {
			await this.interactionRespond(command, {
				type: 1
			});
		} else {
			if (botoptions.info) {
				log.info(
					'SlashCommand',
					`The <<${
						command.data.name
					}>> command was used by <<${`${command.member?.user?.username}#${command.member?.user?.discriminator}`}>> in <<${
						command.channel_id
					}>>.`
				);
			}
			try {
				switch (command.data.name) {
					case 'dn': {
						await this.interactionRespond(command, {
							type: APIInteractionResponseType.ChannelMessageWithSource,
							data: {
								content: 'Deez ***nuts***'
							}
						});
						return;
					}
					case 'say': {
						const id = (command.user || command.member.user).id;
						if (this.client.ownerID.includes(id)) {
							await this.interactionRespond(command, {
								type: APIInteractionResponseType.ChannelMessage,
								data: {
									content: command.data.options[0].value as string
								}
							});
						} else {
							await this.interactionRespond(command, {
								type: APIInteractionResponseType.Acknowledge
							});
						}
						return;
					}
					default: {
						await this.interactionRespond(command, {
							type: APIInteractionResponseType.ChannelMessageWithSource,
							data: {
								content:
									"BushBot slash commands are currently a mess rn, and you just found a slash command that doesn't have any code attached to it. gg"
							}
						});
						return;
					}
				}
			} catch (e) {
				const user = await this.client.users.fetch(
					(command.user || command.member.user).id
				);
				this.error(
					new MessageEmbed({
						title: 'Slash command response error',
						description: stripIndent`
						Error message: ${e.message}
						Error stack: ${await this.client.consts.haste(e.stack)}
						User: ${user.tag} (${user.id})
					`,
						color: this.client.consts.ErrorColor
					})
				);
			}
		}
	}
}
