import { BotCommand } from '../../extensions/BotCommand';
import { MessageEmbed, Message } from 'discord.js';
import {stripIndent} from 'common-tags'
export default class InstallCommand extends BotCommand {
	public constructor() {
		super('install', {
			aliases: ['install'],
			category: 'tag',
			description: {
				content: 'Installing a neu instructions',
				usage: 'install',
			},
			ratelimit: 4,
			cooldown: 4000,
		});
	}

	public async exec(message: Message): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setDescription(
					stripIndent`
					__**Installation Instructions**__
					You will need to install forge to use Minecraft mods, see below on how to do so:
					1) Run normal Minecraft 1.8.9 and once it reaches the title screen wait about 5 seconds and close it.
					2) Install Minecraft **1.8.9** forge from the website here\n- Once you click on the installed you'd like to download, a window will pop up.** Do not click on anything in the middle of your screen**; instead, click on the \`skip ad\` button towards the top right
					3): Open the installer, select install client, and click install
					4): When forge is installed, open the Minecraft launcher, go under the \`installations tab\`, click \`new installation\`, select the version release \`1.8.9-forge1.8.9-11.15.1.xxxx\` (it will usually be all the way towards the bottom).
					5) Once you are done, run this new installation that you just created. Once it reaches the title screen, wait about 5 seconds and close it.
					

					**Installing the NotEnoughUpdates mod:**__
					1): Download the latest mod release from <#693586404256645231>. If it says \`this file may harm your computer\`, click \`allow anyways\` as all java files will be suspect to this from the Windows firewall.
					2): Add the NEU mod:
					- If you have java installed, double click the file, click \`install\`
					- If not, press the windows key + R; type \`%appdata%\`; click on the folder called \`.minecraft\`; click on the folder called \`mods\` and drag the mods file in here.
					4): Open the Minecraft launcher and run your forge installation you set up earlier. 
					5): Then, hop onto Skyblock and run the command /api new. Your api key is automatically filled out and all features should work.\n6): Type \`/neu\`. If you see the NotEnoughUpdates menu, you have done this correctly!
					
					
					If you need any more assistance after following this guide, please send a message in <#714332750156660756> or <#737414807250272258> wait patiently to be helped.`
				)
				.setFooter(`Requested by: ${message.author.tag}`, message.author.avatarURL());
			await message.util.send(embed);
		} catch (e) {
			await message.util.send('Error occured when sending:\n' + (await this.client.consts.haste(e.stack)));
		}
	}
}
