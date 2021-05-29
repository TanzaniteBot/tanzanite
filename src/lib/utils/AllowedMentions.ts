import { MessageMentionOptions, MessageMentionTypes } from 'discord.js';

export default class AllowedMentions {
	public everyone: boolean;
	public users: boolean;
	public roles: boolean;
	public static none(): MessageMentionOptions {
		return { parse: [] };
	}
	public static all(): MessageMentionOptions {
		return {
			parse: ['everyone', 'roles', 'users']
		};
	}
	public static users(): MessageMentionOptions {
		return {
			parse: ['users']
		};
	}
	public static everyone(): MessageMentionOptions {
		return {
			parse: ['everyone']
		};
	}
	public static roles(): MessageMentionOptions {
		return {
			parse: ['roles']
		};
	}
	public constructor(users = true, roles = false, everyone = false) {
		this.everyone = everyone;
		this.roles = roles;
		this.users = users;
	}
	public toObject(): MessageMentionOptions {
		return {
			parse: [
				...(this.users ? ['users'] : []),
				...(this.roles ? ['roles'] : []),
				...(this.everyone ? ['everyone'] : [])
			] as MessageMentionTypes[]
		};
	}
}
