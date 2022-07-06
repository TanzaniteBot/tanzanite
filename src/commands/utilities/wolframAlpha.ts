import {
	AllowedMentions,
	BushCommand,
	clientSendAndPermCheck,
	colors,
	emojis,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { initializeClass as WolframAlphaAPI } from '@notenoughupdates/wolfram-alpha-api';
import assert from 'assert';
import { ApplicationCommandOptionType, EmbedBuilder, type MessageOptions } from 'discord.js';

assert(WolframAlphaAPI);

export default class WolframAlphaCommand extends BushCommand {
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
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { expression: ArgType<'string'>; image: ArgType<'flag'> }
	) {
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		args.image && void message.util.reply({ content: `${emojis.loading} Loading...`, embeds: [] });
		const waApi = WolframAlphaAPI(this.client.config.credentials.wolframAlphaAppId);

		const decodedEmbed = new EmbedBuilder().addFields({
			name: '📥 Input',
			value: await this.client.utils.inspectCleanRedactCodeblock(args.expression)
		});
		const sendOptions: MessageOptions = { content: null, allowedMentions: AllowedMentions.none() };
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
