import { ModlogCommand } from '#commands';
import { emojis, SlashMessage } from '#lib';
import { CommandUtil, ContextMenuCommand } from 'discord-akairo';
import { ApplicationCommandType, type ContextMenuCommandInteraction } from 'discord.js';

export default class ModlogContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('modlog', {
			name: "Users's Modlogs",
			type: ApplicationCommandType.User,
			category: 'user'
		});
	}

	public override async exec(interaction: ContextMenuCommandInteraction) {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: `${emojis.error} You can't use this command outside of a server.`,
				ephemeral: true
			});
		if (!interaction.member?.permissions.has('ManageMessages'))
			return interaction.reply({
				content: `${emojis.error} You can't use this command because you have the **Manage Messages** permission.`,
				ephemeral: true
			});

		await interaction.deferReply({ ephemeral: true });
		const pseudoMessage = new SlashMessage(client, interaction as any);
		pseudoMessage.util = new CommandUtil(client.commandHandler, pseudoMessage);

		void new ModlogCommand().exec(pseudoMessage, { search: interaction.targetId, hidden: false });
	}
}
