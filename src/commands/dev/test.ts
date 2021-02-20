import { BotCommand , PermissionLevel } from '../../extensions/BotCommand';
import AllowedMentions from '../../extensions/AllowedMentions';
import { Message }from 'discord.js';
import mongoose from 'mongoose';
import { /*roleSchema,*/ stickyRoleData } from '../../extensions/mongoose';

export default class TestCommand extends BotCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'dev',
			description: {
				content: 'A command to test wip concepts.',
				usage: 'test',
				examples: ['test'],
			},
			permissionLevel: PermissionLevel.Superuser,
		});
	}
	public async exec(message: Message): Promise<void> {
		/*
		const ExistingData = await stickyRoleData.find({id: message.member.id})
		if (ExistingData.length != 0){
			const Query = await stickyRoleData.findByIdAndUpdate((ExistingData[0]['_id']), {id: message.author.id, left: Date.now(), roles: Array.from(message.member.roles.cache.keys())})
			await Query.save()
		}else {
			const roles = new stickyRoleData({id: message.author.id, left: Date.now(), roles: Array.from(message.member.roles.cache.keys())}) 
			await roles.save()
		}*/

		message.util.send('nothing to test')
	}
}
