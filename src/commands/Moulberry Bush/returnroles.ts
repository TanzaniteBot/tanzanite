import { BushGuildMember } from '../../lib/extensions/BushGuildMember';
import { stickyRoleDataSchema } from '../../lib/utils/mongoose';
import { BushCommand } from '../../lib/extensions/BushCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import log from '../../lib/utils/log';
import { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';

export default class ReturnRolesCommand extends BushCommand {
	public constructor() {
		super('returnroles', {
			aliases: ['returnroles', 'returnrole'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to return sticky roles manually.',
				usage: 'returnroles <user>',
				examples: ['returnroles Bestower']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'What user would you like to return the roles of?',
						retry: '<:no:787549684196704257> Choose a valid user to return the roles of.',
						optional: true
					},
					default: undefined
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_ROLES'],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { member }: { member: BushGuildMember }): Promise<Message> {
		if (message.guild.id !== '516977525906341928') {
			return message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
		}
		const hadRoles = await stickyRoleDataSchema.find({ id: member.id });
		const rolesArray: Array<string> = [];
		hadRoles[0]['roles'].forEach((roleID: string) => {
			const role = member.guild.roles.cache.get(roleID);
			if (role.name != '@everyone' || !role.managed) rolesArray.push(role.id);
		});
		if (rolesArray && rolesArray.length != 0) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			const addedRoles = await member.roles.add(rolesArray, "Returning member's previous roles.").catch(() => {
				log.warn('ReturnRolesCommand', `There was an error returning <<${member.user.tag}>>'s roles.`);
			});
			if (addedRoles) {
				return message.util.reply(`<:yes:787549618770149456> Returned <@!${member.user.id}>'s previous roles.`, { allowedMentions: AllowedMentions.none() });
			} else {
				const failedRoles: string[] = [];
				const successRoles: string[] = [];
				for (let i = 0; i < rolesArray.length; i++) {
					try {
						await member.roles.add(rolesArray[i], "[Fallback] Returning member's previous roles.");
						successRoles.push(rolesArray[i]);
					} catch {
						failedRoles.push(rolesArray[i]);
					}
				}
				if (failedRoles.length > 0) {
					const formatedRoles: Array<string> = [];
					failedRoles.forEach((role): void => {
						formatedRoles.push(`<@&${role}>`);
					});

					const warnEmbed = new MessageEmbed().setColor(this.client.consts.Orange).setDescription(formatedRoles.join('\n'));
					return message.util.reply(`<:no:787549684196704257> There was an error returning some of <@!${member.user.id}>'s previous roles.`, {
						allowedMentions: AllowedMentions.none(),
						embed: warnEmbed
					});
				} else if (successRoles.length == 0) {
					return message.util.reply(`<:no:787549684196704257> Could not return any of <@!${member.user.id}>'s previous roles.`, { allowedMentions: AllowedMentions.none() });
				} else {
					return message.util.reply(`<:yes:787549618770149456> Returned <@!${member.user.id}>'s previous roles.`, { allowedMentions: AllowedMentions.none() });
				}
			}
		} else {
			return message.util.reply(`<:no:787549684196704257> <@!${member.user.id}> Does not appear to have any cached roles.`, { allowedMentions: AllowedMentions.none() });
		}
	}
}
