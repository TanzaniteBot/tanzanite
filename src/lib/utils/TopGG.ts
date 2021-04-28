import { Api } from '@top-gg/sdk';
import { BotStats, WebhookPayload } from '@top-gg/sdk/dist/typings';
import { BotClient } from '../extensions/BotClient';
import { topGGPort, credentials, channels } from '../../config/options';
import express, { Express } from 'express';
import { TextChannel, MessageEmbed, WebhookClient } from 'discord.js';
import { stripIndent } from 'common-tags';
import {
	json as bodyParserJSON,
	urlencoded as bodyParserUrlEncoded
} from 'body-parser';

export class TopGGHandler {
	public api = new Api(credentials.dblToken);
	public client: BotClient;
	public server: Express = express();
	public constructor(client: BotClient) {
		this.client = client;
	}
	public init(): void {
		setInterval(this.postGuilds.bind(this), 60000);
		this.server.use(bodyParserJSON());
		this.server.use(bodyParserUrlEncoded({ extended: true }));
		this.server.post('/dblwebhook', async (req, res) => {
			if (req.headers.authorization !== credentials.dblWebhookAuth) {
				res.status(403).send('Unauthorized');
				await this.client.util.warn(
					`Unauthorized DBL webhook request 👀 ${await this.client.util.haste(
						JSON.stringify(
							{
								'Correct Auth': credentials.dblWebhookAuth,
								'Given Auth': req.headers.authorization,
								'Headers': req.headers,
								'Body': req.body
							},
							null,
							'\t'
						)
					)}`
				);
				return;
			} else {
				res.status(200).send('OK');
			}
			const data = req.body as WebhookPayload;
			await this.postVoteWebhook(data);
		});
		this.server.listen(topGGPort, () => {
			console.log(`Started express top.gg server at port ${topGGPort}`);
		});
	}
	public async postGuilds(): Promise<BotStats> {
		if (this.client.config.dev) return;
		return await this.api.postStats({
			serverCount: this.client.guilds.cache.size,
			shardCount: this.client.shard ? this.client.shard.count : 1
		});
	}
	public async postVoteWebhook(data: WebhookPayload): Promise<void> {
		try {
			if (data.type === 'test') {
				await this.client.util.info(
					`Test vote webhook data recieved, ${await this.client.util.haste(
						JSON.stringify(data, null, '\t')
					)}`
				);
				return;
			} else {
				const parsedData = {
					user: await this.client.users.fetch(data.user),
					type: data.type as 'upvote' | 'test',
					isWeekend: data.isWeekend
				};
				const channel = (await this.client.channels.fetch(
					channels.dblVote
				)) as TextChannel;
				const webhooks = await channel.fetchWebhooks();
				const webhook =
					webhooks.size < 1
						? await channel.createWebhook('Utilibot Voting')
						: webhooks.first();
				const webhookClient = new WebhookClient(webhook.id, webhook.token, {
					allowedMentions: { parse: [] }
				});
				await webhookClient.send(undefined, {
					username: 'Utilibot Voting',
					avatarURL: this.client.user.avatarURL({ dynamic: true }),
					embeds: [
						new MessageEmbed()
							.setTitle('Top.GG Vote')
							// prettier-ignore
							.setDescription(
								stripIndent`
								User: ${parsedData.user.tag}
								Weekend (worth double): ${parsedData.isWeekend ? 'Yes' : 'No'}
							`
							)
							.setAuthor(
								parsedData.user.tag,
								parsedData.user.avatarURL({ dynamic: true })
							)
							.setTimestamp()
					]
				});
			}
		} catch (e) {
			console.error(e);
		}
	}
}
