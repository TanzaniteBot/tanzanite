import { BushCommand, BushMessage, BushSlashMessage, guildSettingsObj, settingsArr } from '@lib';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageEmbed,
	MessageOptions,
	MessageSelectMenu
} from 'discord.js';

export default class SettingsCommand extends BushCommand {
	public constructor() {
		super('settings', {
			aliases: ['settings', 'setting', 'configure', 'config'],
			category: 'config',
			description: {
				content: 'Configure server options.',
				usage: 'settings',
				examples: ['settings']
			},
			slash: true,
			slashOptions: settingsArr.map((setting) => {
				return {
					name: util.camelToSnakeCase(setting),
					description: `Manage the server's ${guildSettingsObj[setting].name.toLowerCase()}`,
					type: 'SUB_COMMAND_GROUP',
					options: guildSettingsObj[setting].type.includes('-array')
						? [
								{
									name: 'view',
									description: `View the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND'
								},
								{
									name: 'add',
									description: `Add a value to the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to add to the server's ${guildSettingsObj[
												setting
											].name.toLowerCase()}?'`,
											type: guildSettingsObj[setting].type.replace('-array', '').toUpperCase() as 'ROLE' | 'STRING' | 'CHANNEL',
											required: true
										}
									]
								},
								{
									name: 'remove',
									description: `Remove a value from the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to remove from the server's ${guildSettingsObj[
												setting
											].name.toLowerCase()}?'`,
											type: guildSettingsObj[setting].type.replace('-array', '').toUpperCase() as 'ROLE' | 'STRING' | 'CHANNEL',
											required: true
										}
									]
								}
						  ]
						: [
								{
									name: 'view',
									description: `View the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND'
								},
								{
									name: 'set',
									description: `Set the server's ${guildSettingsObj[setting].name.toLowerCase()}.`,
									type: 'SUB_COMMAND',
									options: [
										{
											name: 'value',
											description: `What would you like to set the server's ${guildSettingsObj[
												setting
											].name.toLowerCase()} to?'`,
											type: guildSettingsObj[setting].type.toUpperCase() as 'ROLE' | 'STRING' | 'CHANNEL',
											required: true
										}
									]
								}
						  ]
				};
			}),
			slashGuilds: ['516977525906341928', '812400566235430912'],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
			ownerOnly: true
		});
	}

	// *args(): any {}

	public override async exec(message: BushMessage | BushSlashMessage, args: unknown): Promise<unknown> {
		client.console.debugRaw(message.interaction);
		client.console.debugRaw(args);
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		const messageOptions = await this.generateMessageOptions(message);
		const msg = (await message.util.reply(messageOptions)) as Message;
		const collector = msg.createMessageComponentCollector({
			channel: message.channel ?? undefined,
			guild: message.guild,
			message: message as Message,
			time: 300_000
		});

		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id === message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (!message.guild) throw new Error('message.guild is null');
				switch (interaction.customId) {
					case 'command_settingsSel': {
						if (!interaction.isSelectMenu()) return;

						return interaction.update(
							await this.generateMessageOptions(message, interaction.values[0] as keyof typeof guildSettingsObj)
						);
					}
				}
			} else {
				return await interaction?.deferUpdate().catch(() => undefined);
			}
		});
	}

	public async generateMessageOptions(
		message: BushMessage | BushSlashMessage,
		feature?: keyof typeof guildSettingsObj
	): Promise<MessageOptions> {
		if (!message.guild) throw new Error('message.guild is null');
		const settingsEmbed = new MessageEmbed().setTitle(`${message.guild!.name}'s Settings`).setColor(util.colors.default);
		if (!feature) {
			const desc = settingsArr.map((s) => `**${guildSettingsObj[s].name}**`).join('\n');
			settingsEmbed.setDescription(desc);

			const selMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.addOptions(
						...settingsArr.map((s) => ({
							label: guildSettingsObj[s].name,
							value: s,
							description: guildSettingsObj[s].description
						}))
					)
					.setPlaceholder('Select A Setting to View')
					.setMaxValues(1)
					.setMinValues(1)
					.setCustomId('command_settingsSel')
			);
			return { embeds: [settingsEmbed], components: [selMenu] };
		} else {
			const generateCurrentValue = async (
				type: 'string' | 'channel' | 'channel-array' | 'role' | 'role-array'
			): Promise<string> => {
				const feat = await message.guild!.getSetting(feature);
				switch (type.replace('-array', '') as 'string' | 'channel' | 'role') {
					case 'string': {
						return Array.isArray(feat)
							? feat.map((feat) => util.discord.escapeInlineCode(util.inspectAndRedact(feat))).join('\n')
							: util.discord.escapeInlineCode(util.inspectAndRedact(feat));
					}
					case 'channel': {
						return Array.isArray(feat) ? feat.map((feat) => `<#${feat}>`).join('\n') : `<#${feat}>`;
					}
					case 'role': {
						return Array.isArray(feat) ? feat.map((feat) => `<@&${feat}>`).join('\n') : `<@&${feat}>`;
					}
				}
			};
			const components = new MessageActionRow().addComponents(
				new MessageButton().setStyle('PRIMARY').setCustomId('command_settingsBack').setLabel('Back')
			);
			settingsEmbed.setDescription(guildSettingsObj[feature].description);

			settingsEmbed.setFooter(
				`Run "${message.util.isSlash ? '/' : await message.guild.getSetting('prefix')}settings ${feature} ${
					guildSettingsObj[feature].type.includes('-array') ? 'add/remove' : 'set'
				} <value>" to set this setting.`
			);
			settingsEmbed.addField(
				guildSettingsObj[feature].name,
				await generateCurrentValue(feature as 'string' | 'channel' | 'channel-array' | 'role' | 'role-array')
			);
			return { embeds: [settingsEmbed], components: [components] };
		}
	}
}
