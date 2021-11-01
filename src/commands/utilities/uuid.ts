import { BushCommand, type BushMessage } from '@lib';

export default class UuidCommand extends BushCommand {
	public constructor() {
		super('uuid', {
			aliases: ['uuid'],
			category: 'utilities',
			description: {
				content: "Find someone's minecraft uuid",
				usage: ['uuid <ign>'],
				examples: ['uuid ironm00n']
			},
			args: [
				{
					id: 'ign',
					customType: /\w{1,16}/im,
					prompt: {
						start: 'What ign would you like to find the uuid of?',
						retry: '{error} Choose a valid ign.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'ign',
					description: 'What ign would you like to find the uuid of?',
					type: 'STRING',
					required: false
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage, { ign }: { ign: { match: any[]; matches: any[] } }) {
		if (!ign) return await message.util.reply(`${util.emojis.error} Please enter a valid ign.`);
		const readableIGN = ign.match[0];
		try {
			const uuid = await util.findUUID(readableIGN);
			return await message.util.reply(`The uuid for \`${readableIGN}\` is \`${uuid}\``);
		} catch (e) {
			return await message.util.reply(`${util.emojis.error} Could not find an uuid for \`${readableIGN}\`.`);
		}
	}
}
