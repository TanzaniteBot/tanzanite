import got from "got";
import { Message } from "discord.js"
import { MessageEmbed } from "discord.js";

interface hastebinRes {
	key: string
}

async function haste(content:string) {
	const res: hastebinRes = await got.post("https://hastebin.com/documents").json();
	return "https://hastebin.com/"+res.key;
}

async function paginate(message: Message, embeds: MessageEmbed[]) {
	embeds.forEach((e, i) => {
		embeds[i] = embeds[i].setFooter(`Page ${i+1}/${embeds.length} | Click ❔ for help!`)
	})
	let curPage = 0;
	if ((typeof embeds) !== "object") return
	const m = await message.channel.send(embeds[curPage])
	m.react("⏪")
	m.react("◀")
	m.react("⏹")
	m.react("▶")
	m.react("⏩")
	m.react("🔢")
	m.react("❔")
	const filter = (r, u) => ["⏪", "◀", "⏹", "▶", "⏩", "🔢", "❔"].includes(r.emoji.toString())
	const coll = m.createReactionCollector(filter)
	let timeout = setTimeout(async () => {
		await m.edit("Timed out.", {embed: null})
		try {
			await m.reactions.removeAll()
		}
		catch {}
		coll.stop()
	}, 300000)
	coll.on("collect", async (r, u) => {
		if (u.id == message.client.user.id) return
		const userReactions = m.reactions.cache.filter(reaction => reaction.users.cache.has(u.id));
		for (const reaction of userReactions.values()) {
			try {
				await reaction.users.remove(u.id);
			}
			catch {}
		}
		if (u.id != message.author.id) return
		clearTimeout(timeout)
		timeout = setTimeout(async () => {
			await m.edit("Timed out.", {embed: null})
			try {
				await m.reactions.removeAll()
			}
			catch {}
			coll.stop()
		}, 300000)
		if (r.emoji.toString() == "◀") {
			if (curPage - 1 < 0) return
			if (!embeds[curPage - 1]) return
			curPage--
			await m.edit(embeds[curPage])
		}
		else if (r.emoji.toString() == "▶") {
			if (!embeds[curPage + 1]) return
			curPage++
			m.edit(embeds[curPage])
		}
		else if (r.emoji.toString() == "⏹") {
			clearTimeout(timeout)
			await m.edit("Command closed by user.", {embed: null})
			try {
				await m.reactions.removeAll()
			}
			catch {}
			coll.stop()
		}
		else if (r.emoji.toString() == "⏪") {
			curPage = 0
			await m.edit(embeds[curPage])
		}
		else if (r.emoji.toString() == "⏩") {
			curPage = embeds.length - 1
			await m.edit(embeds[curPage])
		}
		else if (r.emoji.toString() == "🔢") {
			const filter = m => m.author.id == message.author.id && !(isNaN(Number(m.content)))
			const m1 = await message.reply("What page would you like to see? (Must be a number)")
			message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time']})
			.then(async messages => {
				let responseMessage: Message = messages.array()[0]
				let resp: number = Number(responseMessage.content)
				const embedChange = embeds[resp - 1] || null
				if (embedChange === null) {
					const mErr = await message.channel.send("Invalid page.")
					try {
						await messages.array()[0].delete()
					}
					catch {}
					setTimeout(async () => {
						await mErr.delete()
						await m1.delete()
					}, 10000);
					return
				};
				curPage = resp - 1
				await m.edit(embedChange)
				try {
					await messages.array()[0].delete()
				}
				catch {}
				await m1.delete()
			})
			.catch(async messages => {
				const mErr = await message.channel.send(`Took too long.`)
				setTimeout(async () => {
					await mErr.delete()
					await m1.delete()
				}, 10000);
			});
		}
		else if (r.emoji.toString() == "❔") {
			let embed4 = new MessageEmbed()
			.setTitle('Legend')
			.setDescription('⏪: first page\n\n◀: previous page\n\n⏹: close command\n\n▶: next page\n\n⏩: last page\n\n🔢: page picker\n\n❔: toggle help menu')
			.setColor(Math.floor(Math.random() * 16777216))
			const e = m.embeds[0]
			const isSame = e.title === embed4.title && e.footer === embed4.footer && e.description === embed4.description
			if (isSame) {
				await m.edit(embeds[curPage])
			}
			else {
				await m.edit(embed4)
			}
		}
	})
}

function sleep(s: number) {
	return new Promise(resolve => setTimeout(resolve, s * 1000));
}

export = {
	haste,
	paginate,
	sleep
}
