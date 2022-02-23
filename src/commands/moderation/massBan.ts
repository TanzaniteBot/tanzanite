import {
	BanResponse,
	banResponse,
	BushCommand,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptionalArgType
} from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, Collection, Embed, PermissionFlagsBits } from 'discord.js';

export default class MassBanCommand extends BushCommand {
	public constructor() {
		super('massBan', {
			aliases: ['mass-ban', 'mass-dban'],
			category: 'moderation',
			description: 'Ban multiple users at once.',
			usage: ['mass-ban <...users> [--reason "<reason>"] [--days <days>]'],
			examples: ['mass-ban 311294982898057217 792202575851814942 792199864510447666 792201010118131713 --reason "too many alts"'],
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

		args.days ??= message.util.parsed?.alias?.includes('dban') ? 1 : 0;

		const ids = args.users.split(/\n| /).filter((id) => id.length > 0);
		if (ids.length === 0) return message.util.send(`${util.emojis.error} You must provide at least one user id.`);
		for (const id of ids) {
			if (!client.constants.regex.snowflake.test(id))
				return message.util.send(`${util.emojis.error} ${id} is not a valid snowflake.`);
		}

		if (!Number.isInteger(args.days) || args.days! < 0 || args.days! > 7) {
			return message.util.reply(`${util.emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		const promises = ids.map((id) =>
			message.guild.massBanOne({
				user: id,
				moderator: message.author.id,
				reason: `[MassBan] ${args.reason ? args.reason.trim() : 'No reason provided.'}`,
				deleteDays: args.days ?? 0
			})
		);

		const res = await Promise.all(promises);

		const map = new Collection(res.map((r, i) => [ids[i], r]));
		client.emit('massBan', message.member!, message.guild!, args.reason ? args.reason.trim() : 'No reason provided.', map);

		const success = (res: BanResponse): boolean => [banResponse.SUCCESS, banResponse.DM_ERROR].includes(res as any);

		const embeds: Embed[] = [];

		for (let i = 0; i < res.length; i++) {
			const embed = () => embeds[embeds.push(new Embed().setColor(util.colors.DarkRed)) - 1];

			const row = `${success(res[i]) ? util.emojis.success : util.emojis.error} ${ids[i]}${
				success(res[i]) ? '' : ` - ${res[i]}`
			}`;

			let currentEmbed = embeds.length ? embeds[embeds.length - 1] : embed();

			if (`${currentEmbed.description}\n${row}`.length >= 2048) currentEmbed = embed();
			currentEmbed.setDescription(`${currentEmbed.description}\n${row}`);
		}

		assert(embeds.length >= 1);

		embeds[0].setTitle(`Mass Ban Results`);

		return message.util.send({ embeds });
	}
}
