import { BushCommand, type BushMessage } from '#lib';

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
					readableType: 'ign',
					prompt: 'What ign would you like to find the uuid of?',
					retry: '{error} Choose a valid ign.',
					slashType: 'STRING'
				},
				{
					id: 'dashed',
					description: 'Include dashes in the uuid.',
					match: 'flag',
					flag: '--dashed',
					prompt: 'Would you like to include dashes in the uuid?',
					slashType: 'BOOLEAN',
					optional: true
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage,
		{ ign, dashed }: { ign: { match: RegExpMatchArray; matches: any[] }; dashed: boolean }
	) {
		if (!ign) return await message.util.reply(`${util.emojis.error} Please enter a valid ign.`);
		const readableIGN = ign.match[0];
		try {
			const uuid = await util.mcUUID(readableIGN, dashed);
			return await message.util.reply(`The uuid for \`${readableIGN}\` is \`${uuid}\``);
		} catch (e) {
			return await message.util.reply(`${util.emojis.error} Could not find an uuid for \`${readableIGN}\`.`);
		}
	}
}
