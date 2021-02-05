import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message    }                  from 'discord.js'                 ;
import   mongoose                      from 'mongoose'                   ;

export default class Test2Command extends BotCommand {
	public constructor() {
		super('test2', {
			aliases: ['test2'],
			category: 'owner',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Another testing command',
				usage: 'test2',
				examples: ['test2'],
			},
			permissionLevel: PermissionLevel.Superuser,
		});
	}
	public async exec(message: Message): Promise<void> {
		const db = mongoose.connection;
		const userBlacklistSchema = new mongoose.Schema({
			id: Number,
			reason: String
		});
		const userBlacklist = mongoose.model('UserInfo', userBlacklistSchema);
		
		await message.channel.send('owo');
	}
}
