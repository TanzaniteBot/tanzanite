import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, Embed, PermissionFlagsBits } from 'discord.js';

export default class MassBanCommand extends BushCommand {
	public constructor() {
		super('massBan', {
			aliases: ['mass-ban', 'mass-dban'],
			category: 'moderation',
			description: 'Ban multiple users at once.',
			usage: ['template <...users> [--reason "<reason>"] [--days <days>]'],
			examples: ['template 1 2'],
			args: [
				{
					id: 'users',
					description: 'The ids of users to ban.',
					type: 'string',
					match: 'rest',
					prompt: 'What are the ids of all the users you would like to ban?',
					retry: '{error} Choose a valid list of user ids to ban.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'reason',
					description: 'The reason for the bans.',
					flag: ['--reason'],
					match: 'option',
					prompt: 'Why should these users be banned?',
					retry: '{error} Choose a valid ban reason.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'days',
					description: 'The number of days of messages to delete when the user is banned, defaults to 0.',
					flag: ['--days', '--delete'],
					match: 'option',
					prompt: "How many days of the user's messages would you like to delete?",
					retry: '{error} Choose between 0 and 7 days to delete messages from the user for.',
					type: util.arg.range('integer', 0, 7, true),
					optional: true,
					slashType: ApplicationCommandOptionType.Integer,
					choices: [...Array(8).keys()].map((v) => ({ name: v.toString(), value: v }))
				}
			],
			quoted: true,
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [PermissionFlagsBits.BanMembers]
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { users: ArgType<'string'>; reason: OptionalArgType<'string'>; days: OptionalArgType<'integer'> }
	) {
		assert(message.inGuild());
		const ids = args.users.split(/\n| /).filter((id) => id.length > 0);
		if (ids.length === 0) return message.util.send(`${util.emojis.error} You must provide at least one user id.`);
		for (const id of ids) {
			if (!client.constants.regex.snowflake.test(id))
				return message.util.send(`${util.emojis.error} ${id} is not a valid snowflake.`);
		}

		if (!Number.isInteger(args.days) || args.days! < 0 || args.days! > 7) {
			return message.util.reply(`${util.emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		if (message.util.parsed?.alias?.includes('dban') && !args.days) args.days = 1;

		const promises = ids.map((id) =>
			message.guild.bushBan({
				user: id,
				reason: `[MassBan] ${args.reason ? args.reason.trim() : 'No reason provided.'}`,
				moderator: message.author.id,
				deleteDays: args.days ?? 0
			})
		);

		const res = await Promise.allSettled(promises);

		const embed = new Embed()
			.setTitle(`Mass Ban Results`)
			.setDescription(
				res.map((r, i) => `${r.status === 'rejected' ? util.emojis.error : util.emojis.success} ${ids[i]}`).join('')
			);

		return message.util.send({ embeds: [embed] });
	}
}
