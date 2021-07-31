import { BushCommandHandlerEvents, BushListener } from '@lib';
import { MessageEmbed } from 'discord.js';

export default class CommandErrorListener extends BushListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error'
		});
	}

	public override async exec(...[error, message, command]: BushCommandHandlerEvents['error']): Promise<unknown> {
		return await CommandErrorListener.handleError(error, message, command);
	}

	public static async handleError(
		...[error, message, command]: BushCommandHandlerEvents['error'] | BushCommandHandlerEvents['slashError']
	): Promise<void> {
		const isSlash = message.util.isSlash;

		const errorNo = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(`${isSlash ? 'Slash ' : ''}Error # \`${errorNo}\`: An error occurred`)
			.addField('Error', await util.codeblock(`${error?.stack || error}`, 1024, 'js'))
			.setColor(util.colors.error)
			.setTimestamp();
		const description = [
			`**User:** ${message.author} (${message.author.tag})`,
			`**Command:** ${command}`,
			`**Channel:** ${message.channel} (${message.channel?.id})`,
			`**Message:** [link](${message.url})`
		];
		// @ts-ignore: shut
		if (error?.code) description.push(`**Error Code:** \`${error.code}\``);
		if (message?.util?.parsed?.content) description.push(`**Command Content:** ${message.util.parsed.content}`);
		errorEmbed.setDescription(description.join('\n'));
		await client.logger.channelError({ embeds: [errorEmbed] });
		const heading = `${isSlash ? 'Slash' : 'Command'}Error`;
		if (message) {
			if (!client.config.owners.includes(message.author.id)) {
				const errorUserEmbed: MessageEmbed = new MessageEmbed()
					.setTitle('A Command Error Occurred')
					.setColor(util.colors.error)
					.setTimestamp();
				if (!command)
					errorUserEmbed.setDescription(`Oh no! An error occurred. Please give the developers code \`${errorNo}\`.`);
				else
					errorUserEmbed.setDescription(
						`Oh no! While running the ${isSlash ? 'slash ' : ''}command \`${
							command.id
						}\`, an error occurred. Please give the developers code \`${errorNo}\`.`
					);
				(await message.util?.send({ embeds: [errorUserEmbed] }).catch((e) => {
					const channel = message.channel.type === 'DM' ? message.channel.recipient.tag : message.channel.name;
					void client.console.warn(heading, `Failed to send user error embed in <<${channel}>>:\n` + e?.stack || e);
				})) ?? client.console.error(heading, `Failed to send user error embed.` + error?.stack || error, false);
			} else {
				const errorDevEmbed = new MessageEmbed()
					// @ts-ignore: shut
					.setTitle(`A Command Error Occurred ${error?.code ? `\`${error.code}\`` : ''}`)
					.setColor(util.colors.error)
					.setTimestamp()
					.setDescription(await util.codeblock(`${error?.stack || error}`, 2048, 'js'));
				(await message.util?.send({ embeds: [errorDevEmbed] }).catch((e) => {
					const channel = message.channel.type === 'DM' ? message.channel.recipient.tag : message.channel.name;
					void client.console.warn(heading, `Failed to send owner error stack in <<${channel}>>.` + e?.stack || e);
				})) ?? client.console.error(heading, `Failed to send owner error stack.` + error?.stack || error, false);
			}
		}
		const channel = message.channel.type === 'DM' ? message.channel.recipient.tag : message.channel.name;
		void client.console.error(
			heading,
			`an error occurred with the <<${command}>> ${isSlash ? 'slash ' : ''}command in <<${channel}>> triggered by <<${
				message?.author?.tag
			}>>:\n` + error?.stack || error,
			false
		);
	}
}
