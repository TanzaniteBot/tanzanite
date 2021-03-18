/*import { BushCommand, PermissionLevel } from '../../extensions/BushCommand';
import { Message } from 'discord.js';
import got from 'got/dist/source';

export default class UuidCommand extends BushCommand {
	public constructor() {
		super('uuid', {
			aliases: ['uuid'],
			category: 'utils',
			description: {
				content: 'Find someone\'s minecraft uuid',
				usage: 'uuid <ign>',
				examples: ['uuid ironm00n'],
			},
			args: [
				{
					id: 'ign',
					type: /\w{1,16}/im,
					match: 'content',
					prompt: {
						start: 'What ign would you like to find the uuid of?',
						retry: '<:no:787549684196704257> Choose a valid ign.',
						optional: false,
					},
				},
			],
			cooldown: 4000,
			ratelimit: 1,
			clientPermissions: ['SEND_MESSAGES']	
		});
	}
	public async exec(message: Message, { ign }: { ign: string }): Promise<Message> {
		if (!ign) return message.reply('<:no:787549684196704257> Please enter a valid ign')
		try {
			const raw = await got.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`),
				json = JSON.parse(raw.body);
			if (raw.statusCode == 200 && json && json['name'] && json['id']){
				return message.util.reply(`The uuid for \`${json['name']}\` is \`${json['id']}\``);
			} else {
				return message.util.reply(`<:no:787549684196704257> Could not find an uuid for ${ign}.`);
			}
		} catch(e) {
			console.error(e)
			console.log(ign)
			return message.util.reply('<:no:787549684196704257> An error has occurred.');
		}
	}
}
*/
