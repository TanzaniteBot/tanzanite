import { BotCommand, colors, mappings, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import assert from 'node:assert/strict';

export default class MoulHammerCommand extends BotCommand {
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
			slashGuilds: [mappings.guilds["Moulberry's Bush"]],
			restrictedGuilds: [mappings.guilds["Moulberry's Bush"]],
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, { user }: { user: ArgType<'user'> }) {
		assert(message.inGuild());

		if (!message.util.isSlash && message.channel?.permissionsFor(message.guild.members.me!).has('ManageMessages')) {
			await message.delete().catch((e) => {});
		}

		const embed = new EmbedBuilder()
			.setTitle('L')
			.setDescription(`${user.username} got moul'ed <:wideberry1:756223352598691942><:wideberry2:756223336832303154>`)
			.setColor(colors.purple);
		await message.util.send({ embeds: [embed] });
	}
}
