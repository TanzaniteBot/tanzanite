import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default class MoulHammerCommand extends BushCommand {
	public constructor() {
		super('moulHammer', {
			aliases: ['moul-hammer'],
			category: "Moulberry's Bush",
			description: 'A command to moul hammer members.',
			usage: ['moul-hammer <user>'],
			examples: ['moul-hammer @IRONM00N'],
			args: [
				{
					id: 'user',
					description: 'The user to moul hammer.',
					type: 'user',
					prompt: 'What user would you like to moul hammer?',
					retry: '{error} Choose a valid user to moul hammer',
					slashType: ApplicationCommandOptionType.User
				}
			],
			slash: true,
			channel: 'guild',
			slashGuilds: ['516977525906341928'],
			restrictedGuilds: ['516977525906341928'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, { user }: { user: ArgType<'user'> }) {
		assert(message.inGuild());

		if (message.channel.permissionsFor(message.guild.members.me!).has('ManageMessages')) await message.delete().catch(() => {});

		const embed = new EmbedBuilder()
			.setTitle('L')
			.setDescription(`${user.username} got moul'ed <:wideberry1:756223352598691942><:wideberry2:756223336832303154>`)
			.setColor(util.colors.purple);
		await message.util.send({ embeds: [embed] });
	}
}
