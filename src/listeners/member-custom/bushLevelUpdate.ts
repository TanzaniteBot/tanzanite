import { BushListener, format, type BushClientEvents } from '#lib';
import assert from 'assert/strict';
import { type TextChannel } from 'discord.js';

type Args = BushClientEvents['bushLevelUpdate'];

export default class BushLevelUpdateListener extends BushListener {
	public constructor() {
		super('bushLevelUpdate', {
			emitter: 'client',
			event: 'bushLevelUpdate',
			category: 'member-custom'
		});
	}

	public async exec(...[member, _oldLevel, newLevel, _currentXp, message]: Args) {
		void this.sendLevelUpMessages(member, newLevel, message);
		void this.assignLevelRoles(member, newLevel, message);
	}

	private async sendLevelUpMessages(member: Args[0], newLevel: Args[2], message: Args[4]) {
		assert(message.inGuild());
		if (!(await message.guild.hasFeature('sendLevelUpMessages'))) return;

		const channel = ((await message.guild.channels
			.fetch((await message.guild.getSetting('levelUpChannel')) ?? message.channelId)
			.catch(() => null)) ?? message.channel) as TextChannel;

		const success = await channel
			.send(`${format.input(member.user.tag)} leveled up to level ${format.input(`${newLevel}`)}.`)
			.catch(() => null);

		if (!success)
			await message.guild.error(
				'bushLevelUpdate',
				`Could not send level up message for ${member.user.tag} in <#${message.channel.id}>.`
			);
	}

	private async assignLevelRoles(member: Args[0], newLevel: Args[2], message: Args[4]) {
		assert(message.inGuild());
		const levelRoles = await message.guild.getSetting('levelRoles');

		if (!Object.keys(levelRoles).length) return;

		const promises = [];
		for (let i = 1; i <= newLevel; i++) {
			if (levelRoles[i]) {
				if (member.roles.cache.has(levelRoles[i])) continue;
				else promises.push(member.roles.add(levelRoles[i], `[LevelRoles] Role given for reaching level ${i}`));
			}
		}
		try {
			if (promises.length) await Promise.all(promises);
		} catch (e: any) {
			await member.guild.error(
				'bushLevelUpdate',
				`There was an error adding level roles to ${member.user.tag} upon reaching to level ${newLevel}.\n${
					'message' in e ? e.message : e
				}`
			);
		}
	}
}
