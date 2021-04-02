import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class TestCommand extends BushCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'dev',
			description: {
				content: 'A command to test wip concepts.',
				usage: 'test',
				examples: ['test']
			},
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES'],
			args: [
				{
					id: 'a',
					type: 'string',
					prompt: {
						start: 'start prompt',
						retry: 'retry prompt',
						optional: false
					}
				}
			]
		});
	}
	public async exec(message: Message, args: { a: string }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.channel.send('<:no:787549684196704257> Only my owners can use this command.');
			return;
		}
		message.reply(args.a, { allowedMentions: AllowedMentions.none() });

		/*const Query = new globalOptionsSchema({
			environment: 'production', 
			settings: {
				disabledCommands: [
					'sh',
				],
				mainGuild: '516977525906341928',
				superUsers: [
					'322862723090219008',
					'211288288055525376',
					'487443883127472129',
					'384620942577369088',
					'483742632212955156',
					'496409778822709251',
					'464970779944157204',
				],
				channelBlacklist: [
					'793169920908984331',
					'714332750156660756',
					'737414807250272258',
				],
				userBlacklist: [
					'454615922909380619',
					'496409778822709251',
				],
				roleBlacklist: [
					'786804858765312030',
				],
				roleWhitelist: [
					'746541309853958186',
					'737308259823910992', 
					'737440116230062091',
				],
				dmChannel: '783129374551572512',
				errorChannel: '788231085125140480',
				generalLogChannel: '794646604887752704'
			}
			
		})
		await Query.save()
		
		/*
		const ExistingData = await stickyRoleData.find({id: message.member.id})
		if (ExistingData.length != 0){
			const Query = await stickyRoleData.findByIdAndUpdate((ExistingData[0]['_id']), {id: message.author.id, left: Date.now(), roles: Array.from(message.member.roles.cache.keys())})
			await Query.save()
		}else {
			const roles = new stickyRoleData({id: message.author.id, left: Date.now(), roles: Array.from(message.member.roles.cache.keys())}) 
			await roles.save()
		}*/

		// const responses = ['Yes master.', "Test it you'r self bitch, I am hungry.", 'Give me a break.', 'I am not your slave.', 'I have done as you wished, now please feed me.', `Someone help me I am trapped in ${message.author.username}'s basement.`];

		// message.util.reply(responses[Math.floor(Math.random() * responses.length)]);
	}
}
