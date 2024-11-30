import { BotListener, Emitter, ModLog, colors, mappings, type BotClientEvents } from '#lib';
import { generateGeneralInfoField, generateRolesField, generateServerInfoField } from '#lib/common/info/UserInfo.js';
import { generateModlogInfo, modlogSeparator } from '#src/commands/moderation/modlog.js';
import { EmbedBuilder, Events } from 'discord.js';
import assert from 'node:assert/strict';

export default class AppealListener extends BotListener {
	public constructor() {
		super('appealListener', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]): Promise<any> {
		if (!this.client.config.isProduction || !message.inGuild() || message.guildId !== mappings.guilds["Moulberry's Bush"]) return;
		if (message.author.id !== '1263249900360044554' || message.embeds.length < 1) return;

		const userId = message.embeds[0].fields?.find?.((f) => f.name === 'What is your discord ID?')?.value;
		if (!userId) return;
		assert(message.embeds[0].fields);

		const thread = await message.startThread({
			name: `${message.embeds[0].fields.find((f) => f.name === 'What type of punishment are you appealing?')?.value} appeal`
		});

		const user = await this.client.users.fetch(userId, { force: true }).catch(() => null);
		if (!user)
			return await thread.send({
				embeds: [
					new EmbedBuilder()
						.setTimestamp()
						.setColor(colors.error)
						.setTitle(
							`${message.embeds[0].fields.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`
						)
						.addFields({ name: '» User Information', value: 'Unable to fetch author, ID was likely invalid' })
				]
			});

		const latestModlogs = (
			await ModLog.findAll({
				where: {
					user: user.id,
					guild: message.guildId,
					pseudo: false,
					hidden: false
				},
				order: [['createdAt', 'DESC']]
			})
		)
			.slice(0, 3)
			.reverse();

		const embed = new EmbedBuilder()
			.setTimestamp()
			.setColor(colors.default)
			.setTitle(`${message.embeds[0].fields.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`)
			.setThumbnail(user.displayAvatarURL());

		embed.addFields(await generateGeneralInfoField(user, '» User Information'));

		member: {
			if (!message.guild.members.cache.has(user.id)) break member;

			const member = message.guild.members.cache.get(user.id)!;

			const memberFields = [generateServerInfoField(member), generateRolesField(member)].filter((f) => f != null);

			embed.addFields(memberFields);
		}

		embed.addFields({
			name: '» Latest Modlogs',
			value: latestModlogs.length
				? latestModlogs.map((ml) => generateModlogInfo(ml, false, false)).join(modlogSeparator)
				: 'No Modlogs Found'
		});

		await thread.send({ content: userId, embeds: [embed] });
	}
}
