import { AutoMod, BushListener, type BushClientEvents } from '#lib';
import { InteractionType } from 'discord.js';

export default class InteractionCreateListener extends BushListener {
	public constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
			category: 'interaction'
		});
	}

	public override async exec(...[interaction]: BushClientEvents['interactionCreate']) {
		if (!interaction) return;
		if ('customId' in interaction && (interaction as any)['customId'].startsWith('test')) return;
		void client.console.verbose(
			'interactionVerbose',
			`An interaction of type <<${InteractionType[interaction.type]}>> was received from <<${interaction.user.tag}>>.`
		);
		if (interaction.type === InteractionType.ApplicationCommand) {
			return;
		} else if (interaction.isButton()) {
			const id = interaction.customId;
			if (['paginate_', 'command_', 'confirmationPrompt_', 'appeal'].some((s) => id.startsWith(s))) return;
			else if (id.startsWith('automod;')) void AutoMod.handleInteraction(interaction);
			else if (id.startsWith('button-role;') && interaction.inCachedGuild()) {
				const [, roleId] = id.split(';');
				const role = interaction.guild.roles.cache.get(roleId);
				if (!role) return interaction.reply({ content: `${util.emojis.error} That role does not exist.`, ephemeral: true });
				const has = interaction.member.roles.cache.has(roleId);
				await interaction.deferReply({ ephemeral: true });
				if (has) {
					const success = await interaction.member.roles.remove(roleId).catch(() => false);
					if (success)
						return interaction.editReply({
							content: `${util.emojis.success} Removed the ${role} role from you.`,
							allowedMentions: {}
						});
					else
						return interaction.editReply({
							content: `${util.emojis.error} Failed to remove ${role} from you.`,
							allowedMentions: {}
						});
				} else {
					const success = await interaction.member.roles.add(roleId).catch(() => false);
					if (success)
						return interaction.editReply({
							content: `${util.emojis.success} Added the ${role} role to you.`,
							allowedMentions: {}
						});
					else
						return interaction.editReply({
							content: `${util.emojis.error} Failed to add ${role} to you.`,
							allowedMentions: {}
						});
				}
			} else return await interaction.reply({ content: 'Buttons go brrr', ephemeral: true });
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId.startsWith('command_')) return;
			return await interaction.reply({
				content: `You selected ${
					Array.isArray(interaction.values)
						? util.oxford(util.surroundArray(interaction.values, '`'), 'and', '')
						: util.format.input(interaction.values)
				}.`,
				ephemeral: true
			});
		}
	}
}
