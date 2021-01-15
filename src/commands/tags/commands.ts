import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import { BotCommand } from '../../classes/BotCommand';

export default class CommandsCommand extends BotCommand {
	public constructor() {
		super('commands', {
			aliases: ['commands', 'command'],
			category: 'tag',
			description: {
				content: 'All the NEU Commands',
				usage: 'commands',
			},
			ratelimit: 4,
			cooldown: 4000,
		});
	}

	public async exec(message: Message): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setDescription(
					"`/neureloadrepo` - Debug command with repo\n`/neuresetrepo` - Deletes all repo files \n`/neudungeowintest` shows the dungeon win animation\n`/neusettings,/neuconfig,/neu` - Opens the settings you can also do \n`/neustats` - Copys helpful info to the clipboard, /neustats modlist to show all your mods\n`/neugamemodes` - lets you set custom gamemodes on a new skyblock island \n`/neucl` - Opens the collection log \n`/neulinks` - Shows links for moulberry \n`/neumap` - Opens map settings\n`/neurename` you can rename skyblock items with this \n`/neuoverlay` - Edit the search bar and quick commands location \n`/neucosmetics` - Lets you equip capes. others can see they if you support moul's patreon \n`/neututorial` - Shows how to use the mod \n`/neucalendar` - Opens the calendar\n`/neuah` - Opens the custom ah \n`/neuec` - Opens the enchant colour menu\n`/neuprofile,/pv,/vp` - Opens the profile viewer\n`/peek` - Shows stats of a player in chat"
				)
				.setFooter(`Requested by: ${message.author.tag}`, message.author.avatarURL());
			message.util.send(embed);
		} catch (e) {
			await message.util.send('Error occured when sending:\n' + (await this.client.consts.haste(e.stack)));
		}
	}
}
