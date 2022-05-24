import { AllowedMentions, BushCommand, type BushMessage } from '#lib';
import { type AkairoMessage } from 'discord-akairo';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';

const encodingTypesArray = ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'latin1', 'binary', 'hex'];
const encodingTypesString = encodingTypesArray.map((e) => `\`${e}\``).join(', ');

export default class DecodeCommand extends BushCommand {
	public constructor() {
		super('decode', {
			aliases: ['decode', 'encode'],
			category: 'utilities',
			description: 'Decode / encode.',
			usage: ['decode <from> <to> <data>'],
			examples: ['decode base64 ascii TmVyZApJbWFnaW5lIGRlY29kaW5nIHRoaXMgbG1hbw=='],
			args: [
				{
					id: 'from',
					description: 'The type of data you are inputting.',
					customType: encodingTypesArray,
					prompt: 'What is the encoding of the original data?',
					retry: `{error} Choose one of the following ${encodingTypesString} for the encoding of the original data.`,
					slashType: ApplicationCommandOptionType.String,
					choices: encodingTypesArray.map((e) => ({ name: e, value: e }))
				},
				{
					id: 'to',
					description: 'The type of data you want the output to be.',
					customType: encodingTypesArray,
					prompt: 'What would you like the encoding of the resulting data to be?',
					retry: `{error} Choose one of the following ${encodingTypesString} for the encoding of the resulting data.`,
					slashType: ApplicationCommandOptionType.String,
					choices: encodingTypesArray.map((e) => ({ name: e, value: e }))
				},
				{
					id: 'data',
					description: 'What you would like to decode.',
					type: 'string',
					match: 'restContent',
					prompt: 'What would you to decode.',
					retry: '{error} Choose a valid string to decode.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | AkairoMessage,
		{ from, to, data }: { from: BufferEncoding; to: BufferEncoding; data: string }
	) {
		const encodeOrDecode = util.capitalizeFirstLetter(message?.util?.parsed?.alias ?? 'decoded');
		const decodedEmbed = new EmbedBuilder()
			.setTitle(`${encodeOrDecode} Information`)
			.addFields([{ name: '📥 Input', value: await util.inspectCleanRedactCodeblock(data) }]);
		try {
			const decoded = Buffer.from(data, from).toString(to);
			decodedEmbed
				.setColor(util.colors.success)
				.addFields([{ name: '📤 Output', value: await util.inspectCleanRedactCodeblock(decoded) }]);
		} catch (error) {
			decodedEmbed.setColor(util.colors.error).addFields([
				{
					name: `📤 Error ${encodeOrDecode.slice(1)}ing`,
					value: await util.inspectCleanRedactCodeblock(error?.stack ?? error)
				}
			]);
		}
		return await message.util.reply({ embeds: [decodedEmbed], allowedMentions: AllowedMentions.none() });
	}
}
