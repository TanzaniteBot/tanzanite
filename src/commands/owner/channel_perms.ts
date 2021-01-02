import { Command } from 'discord-akairo'
import { Role } from 'discord.js'
import { Message } from 'discord.js'

export default class ChannelPermsCommand extends Command {
	public constructor() {
		super('ChannelPerms', {
			aliases: ['ChannelPerms','cperms','cperm','chanperms','chanperm'],
			category: 'owner',
			description: {
				content: 'Use to mass change the channel ',
				usage: 'ChannelPerms <role_id> <perm> <state>',
				examples: [
					'ChannelPerms 783794633129197589 read_messages deny'
				]
			},
			args: [
				{
					id: 'role', //maybe allow just name?
					match: 'content', //should be fine
					type: 'role', //I think this is the best way to do it
					prompt: {
						start: 'What role would you like to change the overrides of?'
					}
				},
				{
					id: 'perm', //need to see if I should find list and make more user friendly 
					match: 'content',//see if there is a better way
					type: 'string', //see if there is a better way
					prompt: {
						start: 'What permission would you like to change?'
					}
				},
				{
					id: 'state', //Deny, Allow, (look up)
					match: 'content', //see if there is a better way
					type: 'string', //see if there is a better way
					prompt: {
						start: 'What would you like to set it to?' //re-word
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000, 
			ownerOnly: true, 
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_CHANNELS','MANAGE_GUILD','MANAGE_ROLES']
		})
	}
	public async exec(message: Message, {role, perm, state}: {role: Role, perm: string, state:string}): Promise<void>{
		
		message.util.send('it isn\'t done yet smh.') 
	}
	
}