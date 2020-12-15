import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'

export default class HelpCommand extends Command {
	public constructor() {
		super('role', {
			aliases: ['role', 'getrole'],
			description: {
				content: 'A command that gives a role to a person.',
				usage: 'getrole ffff00'
			},
			category: 'server',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'color',
					type: /^#?(?<code>[0-9A-F]{6})$/i,
					prompt: {
						start: 'What color would you like?',
						retry: 'Invalid color. Must be format #ffff00 or ffff00. What color would you like?'
					}
				}
			]
		})
	}

	public async exec(message: Message, { color: { match } }: { color: {match: RegExpMatchArray, matches: RegExpMatchArray[] } }): Promise<void> {
		const allowedroles = [
			'736751156310704259', // Server Booster
			'745389025678065704', // Dungeoneer
			'745389161774841868', // Dragon slayer
			'745389150538170409', // Slayer Chad
			'737440116230062091', // Helper
			'737308259823910992', // Mod
			'517361329779113994', // Admin
			'742165914148929536', // Moulberry because why not
		]
		if(!message.member.roles.cache.some(r => allowedroles.includes(r.id) || this.client.ownerID.includes(message.author.id))) {
			message.util.send('You are missing the required roles to run this command')
			return
		}

		if(message.guild.roles.cache.some(r => r.name == `✿ ${message.author.username}`)) {
			if (match) {
				const role = message.guild.roles.cache.filter(r => r.name == `✿ ${message.author.username}`).first()
				const RoleEmbed = new MessageEmbed()
					.setTitle('Custom role change request')
					.setColor(`#${match.groups.code}`)
					.addField('Requested by', `${message.author}`, true)
					.addField('Color', `#${match.groups.code}`, true)
					.setFooter('Editing role...')
				const msg = await message.util.send(RoleEmbed)
				await role.edit({
					color: `#${match.groups.code}`
				}, 'Auto-changing role of a patreon or server booster')
				msg.edit(RoleEmbed.setFooter('Role successfully changed!'))
			}
			else {
				message.util.send('Please provide a valid hex value, you can make one here <https://htmlcolorcodes.com/>')
			}
		}
		else {
			if (match) {
				const RoleEmbed = new MessageEmbed()
					.setTitle('Custom role request')
					.setColor(`#${match.groups.code}`)
					.addField('Requested by', `${message.author}`, true)
					.addField('Color', `#${match.groups.code}`, true)
					.setFooter('Adding role...')
				const msg = await message.util.send(RoleEmbed)
				const role = await message.guild.roles.create({
					data: {
						name: `✿ ${message.author.username}`,
						color: `#${match.groups.code}`,
						position: 45,
					},
					reason: 'Automatically generated role for a patreon subscriber or server booster',
				})
				await message.member.roles.add(role)
				msg.edit(RoleEmbed.setFooter('Role successfully added!'))
			}
			else {
				message.util.send('Please provide a valid hex value, you can make one here <https://htmlcolorcodes.com/>')
			}
		}
		
	}
}