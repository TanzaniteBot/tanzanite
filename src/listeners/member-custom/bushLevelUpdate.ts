import { BushListener, type BushClientEvents } from '#lib';
import { type TextChannel } from 'discord.js';

export default class BushLevelUpdateListener extends BushListener {
	public constructor() {
		super('bushLevelUpdate', {
			emitter: 'client',
			event: 'bushLevelUpdate',
			category: 'member-custom'
		});
	}

	public override async exec(...[member, _oldLevel, newLevel, _currentXp, message]: BushClientEvents['bushLevelUpdate']) {
		if (await message.guild.hasFeature('sendLevelUpMessages')) {
			void (async () => {
				const channel = ((await message.guild.channels
					.fetch((await message.guild.getSetting('levelUpChannel')) ?? message.channelId)
					.catch(() => null)) ?? message.channel) as TextChannel;

				const success = await channel
					.send(`${util.format.input(member.user.tag)} leveled up to level ${util.format.input(`${newLevel}`)}.`)
					.catch(() => null);

				if (!success) await client.console.warn('bushLevelUpdate', `Could not send level up message in ${message.guild}`);
			})();
		}
		void (async () => {
			const levelRoles = await message.guild.getSetting('levelRoles');
			if (Object.keys(levelRoles).length) {
				const promises = [];
				for (let i = 0; i < newLevel; i++) {
					if (levelRoles[i]) {
						if (member.roles.cache.has(levelRoles[i])) continue;
						else promises.push(member.roles.add(levelRoles[i]));
					}
				}
				try {
					if (promises.length) await Promise.all(promises);
				} catch (e) {
					await member.guild.error(
						'bushLevelUpdate',
						`There was an error adding level roles to ${member.user.tag} upon reaching to level ${newLevel}.\n${e?.message ?? e}`
					);
				}
			}
		})();
	}
}
