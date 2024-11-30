import { ModlogCommand } from '#commands';
import { emojis, SlashMessage } from '#lib';
import { CommandUtil, ContextMenuCommand, type AkairoClient } from '@tanzanite/discord-akairo';
import { ApplicationCommandType, MessageFlags, type ContextMenuCommandInteraction } from 'discord.js';

export default class ModlogContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('modlog', {
			name: "Users's Modlogs",
			type: ApplicationCommandType.User,
			category: 'user',
			dmPermission: false
		});
	}

	public override async exec(interaction: ContextMenuCommandInteraction) {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: `${emojis.error} You can't use this command outside of a server.`,
				flags: MessageFlags.Ephemeral
			});
		if (!interaction.member?.permissions.has('ManageMessages'))
			return interaction.reply({
				content: `${emojis.error} You can't use this command because you have the **Manage Messages** permission.`,
				flags: MessageFlags.Ephemeral
			});

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const pseudoMessage = new SlashMessage(<AkairoClient<true>>this.client, interaction as any);
		pseudoMessage.util = new CommandUtil(this.client.commandHandler, pseudoMessage);

		const command = this.client.commandHandler.modules.get('modlog') as ModlogCommand;

		void command.exec(pseudoMessage, { search: interaction.targetId, hidden: false });
	}
}
