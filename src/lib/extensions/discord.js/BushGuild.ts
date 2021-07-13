import { Guild, User } from 'discord.js';
import { ModLogType } from '../..';
import { Guild as GuildDB, GuildModel } from '../../models/Guild';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';

export class BushGuild extends Guild {
	public declare readonly client: BushClient;
	// I cba to do this
	//// public declare members: GuildMemberManager;
	public constructor(client: BushClient, data: unknown) {
		super(client, data);
	}

	public async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
		return ((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id })).get(setting);
	}

	public async setSetting<K extends keyof GuildModel>(setting: K, value: GuildDB[K]): Promise<GuildDB> {
		const row = (await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id });
		row[setting] = value;
		return await row.save();
	}

	public async unban(options: {
		user: BushUserResolvable | User;
		reason?: string;
		moderator?: BushUserResolvable;
	}): Promise<
		| 'success'
		| 'missing permissions'
		| 'user not banned'
		| 'error unbanning'
		| 'error creating modlog entry'
		| 'error removing ban entry'
	> {
		const user = this.client.users.resolveId(options.user);
		const moderator = this.client.users.cache.get(this.client.users.resolveId(options.moderator));

		const bans = await this.bans.fetch();

		let notBanned = false;
		if (!bans.has(user)) notBanned = true;

		const unbanSuccess = this.bans.remove(user, `${moderator.tag} | ${options.reason || 'No reason provided.'}`).catch((e) => {
			if (e?.code === 'UNKNOWN_BAN') {
				notBanned = true;
				return true;
			} else return false;
		});

		if (!unbanSuccess) return 'error unbanning';

		// add modlog entry
		const modlog = await this.client.util
			.createModLogEntry({
				type: ModLogType.UNBAN,
				user,
				moderator: moderator.id,
				reason: options.reason,
				guild: this
			})
			.catch(() => null);
		if (!modlog) return 'error creating modlog entry';

		// remove punishment entry
		const removePunishmentEntrySuccess = await this.client.util
			.removePunishmentEntry({
				type: 'ban',
				user,
				guild: this
			})
			.catch(() => null);
		if (!removePunishmentEntrySuccess) return 'error removing ban entry';

		const userObject = this.client.users.cache.get(user);

		userObject?.send(`You have been unbanned from **${this}** for **${options.reason || 'No reason provided'}**.`);

		if (notBanned) return 'user not banned';
		return 'success';
	}
}
