import { Constants } from 'discord-akairo';
import { BushCommand, BushMessage } from '../../lib';

export default class UuidCommand extends BushCommand {
	public constructor() {
		super('uuid', {
			aliases: ['uuid'],
			category: 'utilities',
			description: {
				content: "Find someone's minecraft uuid",
				usage: 'uuid <ign>',
				examples: ['uuid ironm00n']
			},
			args: [
				{
					id: 'ign',
					type: /\w{1,16}/im,
					match: Constants.ArgumentMatches.PHRASE,
					prompt: {
						start: 'What ign would you like to find the uuid of?',
						retry: '{error} Choose a valid ign.',
						optional: false
					}
				}
			],
			cooldown: 4000,
			ratelimit: 1,
			clientPermissions: ['SEND_MESSAGES']
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async exec(message: BushMessage, { ign }: { ign: { match: any[]; matches: any[] } }): Promise<unknown> {
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
