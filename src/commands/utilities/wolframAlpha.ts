import {
	AllIntegrationTypes,
	AllInteractionContexts,
	AllowedMentions,
	BotCommand,
	colors,
	emojis,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { initializeClass as WolframAlphaAPI } from '@tanzanite/wolfram-alpha';
import { ApplicationCommandOptionType, EmbedBuilder, type MessageCreateOptions } from 'discord.js';
import assert from 'node:assert/strict';

assert(WolframAlphaAPI != null);

export default class WolframAlphaCommand extends BotCommand {
	public constructor() {
		super('wolframAlpha', {
			aliases: ['wolfram-alpha', 'wolfram', 'alpha', 'wolf', 'wa'],
			category: 'utilities',
			description: 'Queries Wolfram|Alpha for a result.',
			usage: ['wolfram-alpha <expression>'],
			examples: ['wolfram-alpha what is the population of france'],
			args: [
				{
					id: 'expression',
					description: 'The expression to query the Wolfram|Alpha api for.',
					type: 'string',
					match: 'rest',
					prompt: 'What would you like to look up?',
					retry: '{error} Pick something to look up.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'image',
					description: 'Whether to use the Simple API instead of the Short Answers API.',
					match: 'flag',
					flag: '--image',
					prompt: 'Would you like to use the Simple API instead of the Short Answers API?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { expression: ArgType<'string'>; image: ArgType<'flag'> }
	) {
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		const appId = this.client.config.credentials.wolframAlphaAppId;

		if (appId === null || appId === '' || appId === '[APP_ID]')
			return message.util.reply(
				message.author.isSuperUser()
					? `${emojis.error} The 'wolframAlphaAppId' credential isn't set so this command cannot be used.`
					: `${emojis.error} Sorry, this command is unavailable.`
			);

		if (args.image) void message.util.reply({ content: `${emojis.loading} Loading...`, embeds: [] });
		const waApi = WolframAlphaAPI(appId);

		const decodedEmbed = new EmbedBuilder().addFields({
			name: '📥 Input',
			value: await this.client.utils.inspectCleanRedactCodeblock(args.expression)
		});
		const sendOptions: MessageCreateOptions = { content: '', allowedMentions: AllowedMentions.none() };
		try {
			const calculated = await (args.image
				? waApi.getSimple({ i: args.expression, timeout: 1, background: '2C2F33', foreground: 'white' })
				: waApi.getShort(args.expression));
			decodedEmbed.setTitle(`${emojis.successFull} Successfully Queried Expression`).setColor(colors.success);

			if (args.image) {
				decodedEmbed.setImage(await this.client.utils.uploadImageToImgur(calculated.split(',')[1]));
				decodedEmbed.addFields({ name: '📤 Output', value: '​' });
			} else {
				decodedEmbed.addFields({
					name: '📤 Output',
					value: await this.client.utils.inspectCleanRedactCodeblock(calculated.toString())
				});
			}
		} catch (error) {
			assert(error instanceof Error);

			decodedEmbed
				.setTitle(`${emojis.errorFull} Unable to Query Expression`)
				.setColor(colors.error)
				.addFields({
					name: `📤 Error`,
					value: await this.client.utils.inspectCleanRedactCodeblock(`${error.name}: ${error.message}`, 'js')
				});
		}
		sendOptions.embeds = [decodedEmbed];

		return await message.util.reply(sendOptions);
	}
}
