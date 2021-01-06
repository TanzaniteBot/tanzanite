import { TextChannel } from 'discord.js'
import { Message, MessageEmbed } from 'discord.js'
import { BotCommand } from '../../classes/BotCommand'

export default class staffRoleCommand extends BotCommand {
	public constructor() {
		super('StaffRole', {
			aliases: ['StaffRole', 'Staff_Role'],
			description: {
				content: 'A command that gives a role to a person.',
				usage: 'StaffRole <hex color you code>'
			},
			category: 'Moulberry Bush',
			clientPermissions: [
				'EMBED_LINKS',
				'MANAGE_ROLES'
			],
			args: [
				{
					id: 'color',
					type: /^#?(?<code>[0-9A-F]{6})$/i,
					prompt: {
						start: 'What color would you like?',
						retry: 'Invalid color. Must be format #ffff00 or ffff00(you can find one here https://htmlcolorcodes.com/). What color would you like?'
					}
				}
			]
		})
	}

	public async exec(message: Message, { color: { match } }: { color: {match: RegExpMatchArray, matches: RegExpMatchArray[] } }): Promise<void> {
		const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
		if(message.guild.id === '516977525906341928'){ //checks if the guild id is = to Moulberry's Bush
			const allowedroles = [
				'783537091946479636', //Trial Helper
				'737440116230062091', // Helper
				'737308259823910992', // Mod
				'782803470205190164', // Sr. Mod 
				'517361329779113994' // Admin
			]
			if(this.client.ownerID.includes(message.author.id)){
				console.log('debug')
			}

			if(!message.member.roles.cache.some(r => allowedroles.includes(r.id) || this.client.ownerID.includes(message.author.id))) {
				message.util.send('You are missing the required roles to run this command')
				return
			}

			if(message.guild.roles.cache.some(r => r.name == `❀ ${message.author.username}`)) {
				if (match) {
					const role = message.guild.roles.cache.filter(r => r.name == `❀ ${message.author.username}`).first()

					const RoleEmbed = new MessageEmbed()
						.setTitle('Custom role change request')
						.setColor(`#${match.groups.code}`)
						.addField('Requested by', `${message.author}`, true)
						.addField('Color', `#${match.groups.code}`, true)
						.setFooter('Editing role...')

					const msg = await message.util.send(RoleEmbed)

					await role.edit({
						color: `#${match.groups.code}`
					}, 'Auto-changing role of a staff member.')
					msg.edit(RoleEmbed.setFooter('Role successfully changed!'))
					generalLogChannel.send(`Edited a staff role for ${message.member.user.tag} with color #${match.groups.code}`)
				}
			}
			else {
				if (match) {
					const pos = await message.guild.roles.cache.get('794615517620994079').rawPosition
					generalLogChannel.send(`pos = ${pos}`)
					const pos1 = pos - 1
					generalLogChannel.send(`pos1 = ${pos1}`)
					const RoleEmbed = new MessageEmbed()
						.setTitle('Custom role request')
						.setColor(`#${match.groups.code}`)
						.addField('Requested by', `${message.author}`, true)
						.addField('Color', `#${match.groups.code}`, true)
						.setFooter('Adding role...')
					const msg = await message.util.send(RoleEmbed)
					const role = await message.guild.roles.create({
						data: {
							name: `❀ ${message.author.username}`,
							color: `#${match.groups.code}`,
							position: pos,
						},
						reason: 'Automatically generated role for a staff member.',
					})
					await message.member.roles.add(role)
					msg.edit(RoleEmbed.setFooter('Role successfully added!'))
					generalLogChannel.send(`Created a *staff* role for ${message.member.displayName} with color #${match.groups.code} and position ${pos1}`)
				}
			}
		}else{
			const WrongGuildEmbed = new MessageEmbed()
				.setTitle('Error')
				.setDescription('This command can only be run in Moulberry\'s Bush')
				.setColor(this.client.consts.ErrorColor)
			message.util.send(WrongGuildEmbed)
		}
	}
}