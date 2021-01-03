import { TextChannel } from 'discord.js'
import { Message, MessageEmbed } from 'discord.js'
import { BotCommand } from '../../classes/BotCommand'

export default class roleCommand extends BotCommand {
	public constructor() {
		super('role', {
			aliases: ['role', 'getrole'],
			description: {
				content: 'A command that gives a role to a person.',
				usage: 'getrole <hex value of the color you want>'
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
			const allowedRoles = [
				'736751156310704259', // Server Booster
				//'745389025678065704', // Dungeoneer
				'745389161774841868', // Dragon slayer
				'745389150538170409', // Slayer Chad
				//'737440116230062091', // Helper
				//'737308259823910992', // Mod
				//'517361329779113994', // Admin
				//'742165914148929536', // Moulberry because why not
			]
			const staffRoles = [
				'783537091946479636', //Trial Helper
				'737440116230062091', // Helper
				'737308259823910992', // Mod
				'782803470205190164', // Sr. Mod 
				'517361329779113994' // Admin
			]

			if(!message.member.roles.cache.some(r => allowedRoles.includes(r.id) || this.client.ownerID.includes(message.author.id))) {
				message.util.send('You are missing the required roles to run this command')
				return
			}

			if(message.member.roles.cache.some(r => staffRoles.includes(r.id))){
				message.util.send(`Staff members should use \`${this.client.config.prefix}staffrole\`.`)
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
					generalLogChannel.send(`Edited a role for ${message.member.user.tag} with color #${match.groups.code}`)
				}
			}
			else {
				if (match) {
					const pos = await message.guild.roles.cache.get('792942957170524160').rawPosition
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
							name: `✿ ${message.author.username}`,
							color: `#${match.groups.code}`,
							position: pos,
						},
						reason: 'Automatically generated role for a patreon subscriber or server booster',
					})
					await message.member.roles.add(role)
					msg.edit(RoleEmbed.setFooter('Role successfully added!'))
					generalLogChannel.send(`Created a role for ${message.member.displayName} with color #${match.groups.code} and position: ${pos1}`)
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