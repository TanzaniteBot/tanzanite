import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import functions from '../../constants/functions';
import { Message } from 'discord.js';

export default class UuidCommand extends BushCommand {
	public constructor() {
		super('uuid', {
			aliases: ['uuid'],
			category: 'utils',
			description: {
				content: "Find someone's minecraft uuid",
				usage: 'uuid <ign>',
				examples: ['uuid ironm00n']
			},
			args: [
				{
					id: 'ign',
					type: /\w{1,16}/im,
					match: 'content',
					prompt: {
						start: 'What ign would you like to find the uuid of?',
						retry: '<:no:787549684196704257> Choose a valid ign.',
						optional: false
					}
				}
			],
			cooldown: 4000,
			ratelimit: 1,
			clientPermissions: ['SEND_MESSAGES'],
			permissionLevel: PermissionLevel.Owner
		});
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async exec(
		message: Message,
		{ ign }: { ign: { match: any[]; matches: any[] } }
	): Promise<Message> {
		if (!ign)
			return message.util.reply(
				'<:no:787549684196704257> Please enter a valid ign'
			);
		const readableign = ign.match[0];
		try {
			const uuid = await functions.findUUID(readableign);
			return message.util.reply(
				`The uuid for \`${readableign}\` is \`${uuid}\``
			);
		} catch (e) {
			return message.util.reply(
				`<:no:787549684196704257> Could not find an uuid for \`${readableign}\`.`
			);
		}
	}
}
