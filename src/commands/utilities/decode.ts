import { AllowedMentions, BushCommand, BushMessage } from '@lib';
import { AkairoMessage } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';

const encodingTypesArray = ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'latin1', 'binary', 'hex'];
const encodingTypesString = '`ascii`, `utf8`, `utf-8`, `utf16le`, `ucs2`, `ucs-2`, `base64`, `latin1`, `binary`, `hex`';

export default class DecodeCommand extends BushCommand {
	public constructor() {
		super('decode', {
			aliases: ['decode', 'encode'],
			category: 'utilities',
			description: {
				content: 'Decode / encode.',
				usage: 'decode <from> <to> <data>',
				examples: ['decode base64 ascii TmVyZApJbWFnaW5lIGRlY29kaW5nIHRoaXMgbG1hbw==']
			},
			args: [
				{
					id: 'from',
					customType: encodingTypesArray,
					prompt: {
						start: 'What is the encoding of the original data?',
						retry: `{error} Choose one of the following ${encodingTypesString} for the encoding of the original data.`
					}
				},
				{
					id: 'to',
					customType: encodingTypesArray,
					prompt: {
						start: 'What would you like the encoding of the resulting data to be?',
						retry: `{error} Choose one of the following ${encodingTypesString} for the encoding of the resulting data.`
					}
				},
				{
					id: 'data',
					type: 'string',
					match: 'restContent',
					prompt: {
						start: 'What would you to decode.',
						retry: '{error} Choose a valid string to decode.'
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			slash: true,
			slashOptions: [
				{
					name: 'from',
					description: 'The type of data you are inputting.',
					type: 'STRING',
					choices: [
						{ name: 'ascii', value: 'ascii' },
						{ name: 'utf8', value: 'utf8' },
						{ name: 'utf-8', value: 'utf-8' },
						{ name: 'utf16le', value: 'utf16le' },
						{ name: 'ucs2', value: 'ucs2' },
						{ name: 'ucs-2', value: 'ucs-2' },
						{ name: 'base64', value: 'base64' },
						{ name: 'latin1', value: 'latin1' },
						{ name: 'binary', value: 'binary' },
						{ name: 'hex', value: 'hex' }
					]
				},
				{
					name: 'to',
					description: 'The type of data you want the output to be.',
					type: 'STRING',
					choices: [
						{ name: 'ascii', value: 'ascii' },
						{ name: 'utf8', value: 'utf8' },
						{ name: 'utf-8', value: 'utf-8' },
						{ name: 'utf16le', value: 'utf16le' },
						{ name: 'ucs2', value: 'ucs2' },
						{ name: 'ucs-2', value: 'ucs-2' },
						{ name: 'base64', value: 'base64' },
						{ name: 'latin1', value: 'latin1' },
						{ name: 'binary', value: 'binary' },
						{ name: 'hex', value: 'hex' }
					]
				},
				{
					name: 'data',
					description: 'What you would like to decode.',
					type: 'STRING'
				}
			]
		});
	}

	public override async exec(
		message: BushMessage | AkairoMessage,
		{ from, to, data }: { from: BufferEncoding; to: BufferEncoding; data: string }
	): Promise<unknown> {
		const encodeOrDecode = util.capitalizeFirstLetter(message?.util?.parsed?.alias) || 'Decoded';
		const decodedEmbed = new MessageEmbed()
			.setTitle(`${encodeOrDecode} Information`)
			.addField('📥 Input', await util.inspectCleanRedactCodeblock(data, null));
		try {
			const decoded = Buffer.from(data, from).toString(to);
			decodedEmbed.setColor(util.colors.success).addField('📤 Output', await util.inspectCleanRedactCodeblock(decoded, null));
		} catch (error) {
			decodedEmbed
				.setColor(util.colors.error)
				.addField(`📤 Error ${encodeOrDecode.slice(1)}ing`, await util.inspectCleanRedactCodeblock(error.stack, null));
		}
		return await message.util.reply({ embeds: [decodedEmbed], allowedMentions: AllowedMentions.none() });
	}
}
