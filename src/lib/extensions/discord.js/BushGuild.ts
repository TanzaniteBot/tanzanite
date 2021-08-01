import { Guild } from 'discord.js';
import { Guild as GuildDB, GuildModel } from '../../models/Guild';
import { ModLogType } from '../../models/ModLog';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuildMember } from './BushGuildMember';
import { BushGuildMemberManager } from './BushGuildMemberManager';
import { BushUser } from './BushUser';

export class BushGuild extends Guild {
	public declare readonly client: BushClient;
	public declare readonly me: BushGuildMember | null;
	public declare members: BushGuildMemberManager;
	public constructor(client: BushClient, data: unknown) {
		super(client, data);
	}

	public async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
		return (
			client.cache.guilds.get(this.id)?.[setting] ??
			((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id }))[setting]
		);
	}

	public async setSetting<K extends keyof GuildModel>(setting: K, value: GuildDB[K]): Promise<GuildDB> {
		const row = (await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id });
		row[setting] = value;
		client.cache.guilds.set(this.id, row.toJSON() as GuildDB);
		return await row.save();
	}

	public async unban(options: {
		user: BushUserResolvable | BushUser;
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
		const user = client.users.resolveId(options.user);
		const moderator = client.users.cache.get(client.users.resolveId(options.moderator));

		const bans = await this.bans.fetch();

		let notBanned = false;
		if (!bans.has(user)) notBanned = true;

		const unbanSuccess = await this.bans
			.remove(user, `${moderator.tag} | ${options.reason || 'No reason provided.'}`)
			.catch((e) => {
				if (e?.code === 'UNKNOWN_BAN') {
					notBanned = true;
					return true;
				} else return false;
			});

		if (!unbanSuccess) return 'error unbanning';

		// add modlog entry
		const modlog = await util
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
		const removePunishmentEntrySuccess = await util
			.removePunishmentEntry({
				type: 'ban',
				user,
				guild: this
			})
			.catch(() => null);
		if (!removePunishmentEntrySuccess) return 'error removing ban entry';

		const userObject = client.users.cache.get(user);

		userObject?.send(`You have been unbanned from **${this}** for **${options.reason || 'No reason provided'}**.`);

		if (notBanned) return 'user not banned';
		return 'success';
	}
}
