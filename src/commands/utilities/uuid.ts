import { AllowedMentions, ArgType, BushCommand, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';

export default class UuidCommand extends BushCommand {
	public constructor() {
		super('uuid', {
			aliases: ['uuid'],
			category: 'utilities',
			description: "Find someone's minecraft uuid",
			usage: ['uuid <ign>'],
			examples: ['uuid ironm00n'],
			args: [
				{
					id: 'ign',
					description: 'The ign to find the ign of.',
					customType: /\w{1,16}/im,
					readableType: 'string[1,16]',
					prompt: 'What ign would you like to find the uuid of?',
					retry: '{error} Choose a valid ign.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'dashed',
					description: 'Include dashes in the uuid.',
					match: 'flag',
					flag: ['--dashed', '-d'],
					prompt: 'Would you like to include dashes in the uuid?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { ign: ArgType<'regex'> | string; dashed: ArgType<'flag'> }
	) {
		if (typeof args.ign === 'string') args.ign = { match: /\w{1,16}/im.exec(args.ign)!, matches: [] };

		if (!args.ign.match) return await message.util.reply(`${util.emojis.error} Please enter a valid ign.`);
		const readableIGN = args.ign.match[0];
		try {
			const uuid = await util.mcUUID(readableIGN, args.dashed);
			return await message.util.reply({
				content: `The uuid for ${util.format.input(readableIGN)} is ${util.format.input(uuid)}`,
				allowedMentions: AllowedMentions.none()
			});
		} catch (e) {
			return await message.util.reply({
				content: `${util.emojis.error} Could not find an uuid for ${util.format.input(readableIGN)}.`,
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
