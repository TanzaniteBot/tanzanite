import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import got from 'got/dist/source';

export default class ServerStatusCommand extends Command {
    public constructor() {
        super('serverstatus', {
            aliases: ['serverstatus', 'ss'],
            category: 'info',
            ratelimit: 4,
            cooldown: 4000,
        });
    };
    public async exec(message: Message) {
		const msg: Message = await message.util.send("Checking servers:\nMain: ...\nBackup: ...")
		let main, back: string;
		try {
			JSON.parse((await got.get("http://51.79.51.21/lowestbin.json")).body)
			main = "✅"
		} catch (e) {
			main = "❌"
		}

		await msg.edit(`Checking servers:\nMain: ${main}\nBackup: ...`)

		try {
			JSON.parse((await got.get("http://51.75.78.252/lowestbin.json")).body)
			back = "✅"
		} catch (e) {
			back = "❌"
		}

		await msg.edit(`Checking servers:\nMain: ${main}\nBackup: ${back}`)

		if ((back == "✅" && main == "❌") || (main == "✅" && back == "❌")) {
			await msg.edit("It appears one of the servers was online, this means that it should be fine as long as you have the latest version of NEU.")
		}
		else if (back == "❌" && main == "❌") {
			await msg.edit("It appears both of the servers are offline, this means that everything related to prices will likely not work.")
		}
		else {
			await msg.edit("Both of the servers are online, all features related to prices will likely work.")
		}
    };
};