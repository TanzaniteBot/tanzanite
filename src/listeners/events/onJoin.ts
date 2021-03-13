import chalk from 'chalk';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import db from '../../constants/db';
import functions from '../../constants/functions';
import { BotListener } from '../../extensions/BotListener';
import { stickyRoleDataSchema } from '../../extensions/mongoose';

export default class OnJoinListener extends BotListener {
	public constructor() {
		super('OnJoinListener', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		let welcomeChannel: string = (await db.guildGet('welcomeChannel', member.guild.id, null)) as string;
		let success = true;
		if (!welcomeChannel && member.guild.id === '516977525906341928') {
			welcomeChannel = '737460457375268896';
		}
		if (welcomeChannel) {
			const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel);
			if (member.guild.id != welcome.guild.id) throw 'Welcome channel must be in the guild.';
			const embed: MessageEmbed = new MessageEmbed().setDescription(`:slight_smile: \`${member.user.tag}\` joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`).setColor('7ed321');
			await welcome
				.send(embed)
				.catch(() => {
					console.warn(`${chalk.bgYellow(`${functions.timeStamp()} [OnJoin]`)} Failed to send message for ${chalk.bgBlueBright(member.user.tag)} in ${chalk.bgBlueBright(member.guild.name)}`);
					return (success = false);
				})
				.then(() => {
					if (this.client.config.verbose && success) {
						console.info(`${chalk.bgCyan(`${functions.timeStamp()} [OnJoin]`)} Sent a message for ${chalk.bgBlueBright(member.user.tag)} in ${chalk.bgBlueBright(member.guild.name)}`);
					}
				});
		}

		if (member.guild.id == '516977525906341928') {
			let RoleSuccess = true;
			const hadRoles = await stickyRoleDataSchema.find({ id: member.id });
			if (hadRoles && hadRoles.length != 0) {
				await member.roles
					.add(hadRoles[0]['roles'], "Returning member's previous roles.")
					.catch(() => {
						console.warn(`${chalk.bgYellow(`${functions.timeStamp()} [OnJoin]`)} Failed to assign sticky roles to ${chalk.bgBlueBright(member.user.tag)} in ${chalk.bgBlueBright(member.guild.name)}.`);
						return (RoleSuccess = false);
					})
					.then(() => {
						if (this.client.config.verbose && success) {
							console.info(`${chalk.bgCyan(`${functions.timeStamp()} [OnJoin]`)} Assigned sticky roles to ${chalk.bgBlueBright(member.user.tag)} in ${chalk.bgBlueBright(member.guild.name)}.`);
						}
					});
			} else {
				await member.roles
					.add(['783794633129197589', '801976603772321796'], 'Join roles.')
					.catch(() => {
						console.warn(`${chalk.bgYellow(`${functions.timeStamp()} [OnJoin]`)} Failed to assign join roles to ${chalk.bgBlueBright(member.user.tag)}, in ${chalk.bgBlueBright(member.guild.name)}.`);
						return (RoleSuccess = false);
					})
					.then(() => {
						if (this.client.config.verbose && success) {
							console.warn(`${chalk.bgCyan(`${functions.timeStamp()} [OnJoin]`)} Assigned join roles to ${chalk.bgBlueBright(member.user.tag)}, in ${chalk.bgBlueBright(member.guild.name)}.`);
						}
					});
			}
		}
	}
}
