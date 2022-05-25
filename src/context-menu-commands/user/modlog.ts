import { ModlogCommand } from '#commands';
import { BushCommandUtil, BushSlashMessage } from '#lib';
import { ContextMenuCommand } from 'discord-akairo';
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
				content: `${util.emojis.error} You can't use this command outside of a server.`,
				ephemeral: true
			});
		if (!interaction.member?.permissions.has('ManageMessages'))
			return interaction.reply({
				content: `${util.emojis.error} You can't use this command because you have the **Manage Messages** permission.`,
				ephemeral: true
			});

		await interaction.deferReply({ ephemeral: true });
		const pseudoMessage = new BushSlashMessage(client, interaction as any);
		pseudoMessage.util = new BushCommandUtil(client.commandHandler, pseudoMessage);

		void new ModlogCommand().exec(pseudoMessage, { search: interaction.targetId, hidden: false });
	}
}
