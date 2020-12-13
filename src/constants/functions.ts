import got from "got";

interface hastebinRes {
	key: string
}

export = {
	haste: async function(content:string) {
		const res: hastebinRes = await got.post("https://hastebin.com/documents").json();
		return "https://hastebin.com/"+res.key;
	}
}