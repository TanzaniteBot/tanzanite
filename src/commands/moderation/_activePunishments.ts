// import { BushCommand, ModLog, ModLogModel, OptArgType, type CommandMessage, type SlashMessage } from '#lib';
// import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
// import { FindOptions, Op } from 'sequelize';

// const punishmentTypes = ['ban', 'kick', 'mute', 'warn', 'role'] as const;

// export default class ActivePunishmentsCommand extends BushCommand {
// 	public constructor() {
// 		super('activePunishments', {
// 			aliases: ['active-punishments', 'ap'],
// 			category: 'moderation',
// 			description: 'Gets a list of all the active punishment in the server.',
// 			usage: [`active-punishments [--moderator <user>] [--type <${punishmentTypes.map((v) => `'${v}'`).join('|')}>]`],
// 			examples: ['active-punishments'],
// 			args: [
// 				{
// 					id: 'moderator',
// 					description: 'Only show active punishments by this moderator.',
// 					type: 'user',
// 					match: 'option',
// 					prompt: 'Only show active punishments from what user?',
// 					optional: true,
// 					slashType: ApplicationCommandOptionType.User,
// 					slashResolve: 'Member'
// 				},
// 				{
// 					id: 'type',
// 					description: 'Only show active punishments of this type.',
// 					customType: [...punishmentTypes],
// 					readableType: punishmentTypes.map((v) => `'${v}'`).join('|'),
// 					match: 'option',
// 					optional: true,
// 					slashType: ApplicationCommandOptionType.String,
// 					choices: punishmentTypes.map((v) => ({ name: v, value: v }))
// 				}
// 			],
// 			slash: true,
// 			channel: 'guild',
// 			hidden: true,
// 			clientPermissions: (m) => util.clientSendAndPermCheck(m),
// 			userPermissions: (m) => util.userGuildPermCheck(m, [PermissionFlagsBits.ManageMessages])
// 		});
// 	}

// 	public override async exec(
// 		message: CommandMessage | SlashMessage,
// 		args: { moderator: OptArgType<'user' | 'member'>; type: typeof punishmentTypes[number] }
// 	) {
// 		const where: FindOptions<ModLogModel>['where'] = { guild: message.guild!.id };
// 		if (args.moderator?.id) where.user = args.moderator.id;
// 		if (args.type) {
// 			switch (args.type) {
// 				case 'ban':
// 					where.type = { [Op.or]: ['PERM_BAN', 'TEMP_BAN', 'UNBAN'] };
// 					break;
// 				case 'kick':
// 					where.type = { [Op.or]: ['KICK'] };
// 					break;
// 				case 'mute':
// 					where.type = { [Op.or]: ['PERM_MUTE', 'TEMP_MUTE', 'UNMUTE'] };
// 					break;
// 				case 'warn':
// 					where.type = { [Op.or]: ['WARN'] };
// 					break;
// 				case 'role':
// 					where.type = { [Op.or]: ['PERM_PUNISHMENT_ROLE', 'TEMP_PUNISHMENT_ROLE', 'REMOVE_PUNISHMENT_ROLE'] };
// 					break;
// 				default:
// 					return message.util.reply(`${util.emojis.error} You supplied an invalid case type to filter by.`);
// 			}
// 		}

// 		const logs = await ModLog.findAll({
// 			where,
// 			order: [['createdAt', 'ASC']]
// 		});
// 	}
// }
