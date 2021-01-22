import { User } from 'discord.js';
import { GuildMember } from 'discord.js';
import { Message, TextChannel } from 'discord.js';
import AllowedMentions from '../../extensions/AllowedMentions';
import { BotListener } from '../../extensions/BotListener';

export default class ReactionRoleRemoveListener extends BotListener {
	public constructor() {
		super('ReactionRoleRemoveListener', {
			emitter: 'client',
			event: 'messageReactionRemove',
			category: 'client',
		});
	}

	public async exec(message: Message, member: GuildMember): Promise<void> {
		if (!message.guild) return;
		if (message.author.bot) return;
		if (message.id=='802174847210749982'&&message.channel.id=='802174237062070292') {
			try {
				console.log(member)
				member.roles.remove('802173969821073440')
			}catch (e){
				console.log(e)
			}
		} else {
			console.log('rr remove else')
			return;
		}
	}
}
