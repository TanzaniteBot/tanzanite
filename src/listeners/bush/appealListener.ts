import { BushListener, colors, mappings, ModLog, type BushClientEvents } from '#lib';
import assert from 'assert/strict';
import { EmbedBuilder } from 'discord.js';
import UserInfoCommand from '../../commands/info/userInfo.js';
import ModlogCommand from '../../commands/moderation/modlog.js';

export default class AppealListener extends BushListener {
	public constructor() {
		super('appealListener', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'bush'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']): Promise<any> {
		if (!this.client.config.isProduction || !message.inGuild() || message.guildId !== mappings.guilds["Moulberry's Bush"]) return;
		if (message.author.id !== '855446927688335370' || message.embeds.length < 1) return;

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
							`${message.embeds[0].fields!.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`
						)
						.addFields({ name: '» User Information', value: 'Unable to fetch author, ID was likely invalid' })
				]
			});

		const latestModlogs = (
			await ModLog.findAll({
				where: {
					user: user.id,
					guild: message.guildId
				},
				order: [['createdAt', 'DESC']]
			})
		)
			.slice(0, 3)
			.reverse();

		const embed = new EmbedBuilder()
			.setTimestamp()
			.setColor(colors.default)
			.setTitle(`${message.embeds[0].fields!.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`)
			.setThumbnail(user.displayAvatarURL());

		await UserInfoCommand.generateGeneralInfoField(embed, user, '» User Information');

		member: {
			if (!message.guild.members.cache.has(user.id)) break member;
			const member = message.guild.members.cache.get(user.id)!;
			UserInfoCommand.generateServerInfoField(embed, member);
			if (member.roles.cache.size > 1) UserInfoCommand.generateRolesField(embed, member);
		}

		embed.addFields({
			name: '» Latest Modlogs',
			value: latestModlogs.length
				? latestModlogs.map((ml) => ModlogCommand.generateModlogInfo(ml, false, false)).join(ModlogCommand.separator)
				: 'No Modlogs Found'
		});

		await thread.send({ embeds: [embed] });
	}
}
