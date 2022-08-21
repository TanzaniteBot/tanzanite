import { BushCommand, clientSendAndPermCheck, colors, emojis, type CommandMessage } from '#lib';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default class ServerStatusCommand extends BushCommand {
	public constructor() {
		super('serverStatus', {
			aliases: ['server-status', 'ss'],
			category: "Moulberry's Bush",
			description: "Gives the status of moulberry's server",
			usage: ['server-status'],
			examples: ['server-status', 'ss'],
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: CommandMessage) {
		const msgEmbed = new EmbedBuilder()
			.setTitle('Server status')
			.setDescription(`Checking server:\n${emojis.loading}`)
			.setColor(colors.default)
			.setFooter({ text: 'Checking https://moulberry.codes/lowestbin.json' });
		await message.util.reply({ embeds: [msgEmbed] });
		let main;
		try {
			const res = await fetch('https://moulberry.codes/lowestbin.json').then((p) => (p.ok ? p.json() : null));
			main = res ? emojis.success : emojis.error;
		} catch (e) {
			main = emojis.error;
		}
		await message.util.edit({ embeds: [msgEmbed.setDescription(`Checking server:\n${main}`)] });
		if (main == emojis.success) {
			await message.util.edit({
				embeds: [
					msgEmbed
						.addFields({ name: 'Status', value: 'The server is online, all features related to prices will likely work.' })
						.setColor(colors.success)
				]
			});
		} else {
			await message.util.edit({
				embeds: [
					msgEmbed
						.addFields({
							name: 'Status',
							value:
								"It appears Moulberry's server is offline, this means that everything related to prices will likely not work."
						})
						.setColor(colors.error)
				]
			});
		}
	}
}
