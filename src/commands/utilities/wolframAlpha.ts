import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed, MessageOptions } from 'discord.js';
import WolframAlphaAPI from 'wolfram-alpha-api';

export default class WolframAlphaCommand extends BushCommand {
	public constructor() {
		super('wolframAlpha', {
			aliases: ['wolfram-alpha', 'wolfram', 'alpha', 'wolf', 'wa'],
			category: 'utilities',
			description: {
				content: 'Queries Wolfram|Alpha for a result.',
				usage: 'wolfram-alpha <expression>',
				examples: ['wolfram-alpha what is the population of france']
			},
			args: [
				{ id: 'image', match: 'flag', flag: '--image' },
				{
					id: 'expression',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'What would you like to look up?',
						retry: '{error} Pick something to look up.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'expression',
					description: 'What would you like to look up?',
					type: 'STRING',
					required: true
				},
				{
					name: 'image',
					description: 'Would you like to use the Simple API instead of the Short Answers API?',
					type: 'BOOLEAN',
					required: false
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}
	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { expression: string; image: boolean }
	): Promise<unknown> {
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		args.image && void message.util.reply({ content: `${util.emojis.loading} Loading...`, embeds: [] });
		const waApi = WolframAlphaAPI(client.config.credentials.wolframAlphaAppId);

		const decodedEmbed = new MessageEmbed().addField('📥 Input', await util.inspectCleanRedactCodeblock(args.expression));
		const sendOptions: MessageOptions = { content: null, allowedMentions: AllowedMentions.none() };
		try {
			const calculated = await (args.image
				? waApi.getSimple({ i: args.expression, timeout: 1, background: '2C2F33', foreground: 'white' })
				: waApi.getShort(args.expression));
			decodedEmbed.setTitle(`${util.emojis.successFull} Successfully Queried Expression`).setColor(util.colors.success);

			if (args.image) {
				decodedEmbed.setImage(await util.uploadImageToImgur(calculated.split(',')[1]));
				decodedEmbed.addField('📤 Output', '​');
			} else {
				decodedEmbed.addField('📤 Output', await util.inspectCleanRedactCodeblock(calculated.toString()));
			}
		} catch (error) {
			decodedEmbed
				.setTitle(`${util.emojis.errorFull} Unable to Query Expression`)
				.setColor(util.colors.error)
				.addField(`📤 Error`, await util.inspectCleanRedactCodeblock(`${error.name}: ${error.message}`, 'js'));
		}
		sendOptions.embeds = [decodedEmbed];

		return await message.util.reply(sendOptions);
	}
}
