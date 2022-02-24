import { BushCommand, ButtonPaginator, Shared, type BushMessage } from '#lib';
import { Routes } from 'discord-api-types/rest/v9';
import {
	ActionRow,
	ActionRowComponent,
	ButtonComponent,
	ButtonStyle,
	Embed,
	GatewayDispatchEvents,
	type ApplicationCommand,
	type Collection
} from 'discord.js';
import badLinksSecretArray from '../../lib/badlinks-secret.js';
import badLinksArray from '../../lib/badlinks.js';
import badWords from '../../lib/badwords.js';

export default class TestCommand extends BushCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'dev',
			description: 'A command to test stuff.',
			usage: ['test [feature]'],
			examples: ['test lots of buttons', 'test buttons'],
			args: [
				{
					id: 'feature',
					description: 'The feature to test.',
					match: 'rest',
					prompt: 'start prompt',
					retry: 'retry prompt',
					optional: true,
					slashType: false
				}
			],
			superUserOnly: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage, args: { feature: string }) {
		const responses = [
			'Yes master.',
			'Test it your self bitch, I am hungry.',
			'Give me a break.',
			'I am not your slave.',
			'I have done as you wished, now please feed me.',
			`Someone help me I am trapped in ${message.author.username}'s basement.`
		];
		if (!message.author.isOwner()) {
			return await message.util.reply(responses[Math.floor(Math.random() * responses.length)]);
		}

		if (['button', 'buttons'].includes(args?.feature?.toLowerCase())) {
			const ButtonRow = new ActionRow().addComponents(
				new ButtonComponent().setStyle(ButtonStyle.Primary).setCustomId('primaryButton').setLabel('Primary'),
				new ButtonComponent().setStyle(ButtonStyle.Secondary).setCustomId('secondaryButton').setLabel('Secondary'),
				new ButtonComponent().setStyle(ButtonStyle.Success).setCustomId('successButton').setLabel('Success'),
				new ButtonComponent().setStyle(ButtonStyle.Danger).setCustomId('dangerButton').setLabel('Danger'),
				new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('Link').setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
			);
			return await message.util.reply({ content: 'buttons', components: [ButtonRow] });
		} else if (['embed', 'button embed'].includes(args?.feature?.toLowerCase())) {
			const embed = new Embed()
				.addField({ name: 'Field Name', value: 'Field Content' })
				.setAuthor({ name: 'Author', iconURL: 'https://www.w3schools.com/w3css/img_snowtops.jpg', url: 'https://google.com/' })
				.setColor(message.member?.displayColor ?? util.colors.default)
				.setDescription('Description')
				.setFooter({ text: 'Footer', iconURL: message.author.avatarURL() ?? undefined })
				.setURL('https://duckduckgo.com/')
				.setTimestamp()
				.setImage('https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png')
				.setThumbnail(
					'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2134&q=80'
				)
				.setTitle('Title');

			const buttonRow = new ActionRow().addComponents(
				new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('Link').setURL('https://google.com/')
			);
			return await message.util.reply({ content: 'Test', embeds: [embed], components: [buttonRow] });
		} else if (['lots of buttons'].includes(args?.feature?.toLowerCase())) {
			const ButtonRows: ActionRow<ActionRowComponent>[] = [];
			for (let a = 1; a <= 5; a++) {
				const row = new ActionRow();
				for (let b = 1; b <= 5; b++) {
					const id = (a + 5 * (b - 1)).toString();
					const button = new ButtonComponent().setStyle(ButtonStyle.Primary).setCustomId(id).setLabel(id);
					row.addComponents(button);
				}
				ButtonRows.push(row);
			}
			return await message.util.reply({ content: 'buttons', components: ButtonRows });
		} else if (['paginate'].includes(args?.feature?.toLowerCase())) {
			const embeds = [];
			for (let i = 1; i <= 5; i++) {
				embeds.push(new Embed().setDescription(i.toString()));
			}
			return await ButtonPaginator.send(message, embeds);
		} else if (['lots of embeds'].includes(args?.feature?.toLowerCase())) {
			const description = 'This is a description.';
			const _avatar = message.author.avatarURL() ?? undefined;
			const author = { name: 'This is a author', iconURL: _avatar };
			const footer = { text: 'This is a footer', iconURL: _avatar };
			const fields = Array(25)
				.fill(0)
				.map((_, i) => ({ name: `Field ${i}`, value: 'Field Value' }));
			const c = util.colors;
			const o = { description, author, footer, fields, time: Date.now() };

			const colors = [c.red, c.orange, c.gold, c.yellow, c.green, c.darkGreen, c.aqua, c.blue, c.purple, c.pink];

			const embeds = colors.map((c, i) => ({ ...o, title: `Embed Title ${i}`, color: c }));

			const ButtonRows: ActionRow<ActionRowComponent>[] = [];
			for (let a = 1; a <= 5; a++) {
				const row = new ActionRow();
				for (let b = 1; b <= 5; b++) {
					const id = (a + 5 * (b - 1)).toString();
					const button = new ButtonComponent().setStyle(ButtonStyle.Secondary).setCustomId(id).setLabel(id);
					row.addComponents(button);
				}
				ButtonRows.push(row);
			}
			return await message.util.reply({ content: 'this is content', components: ButtonRows, embeds });
		} else if (['delete slash commands'].includes(args?.feature?.toLowerCase())) {
			if (!message.guild) return await message.util.reply(`${util.emojis.error} This test can only be run in a guild.`);
			await client.guilds.fetch();
			const promises: Promise<Collection<string, ApplicationCommand>>[] = [];
			client.guilds.cache.each((guild) => {
				promises.push(guild.commands.set([]));
			});
			await Promise.all(promises);

			await client.application!.commands.fetch();
			await client.application!.commands.set([]);

			return await message.util.reply(`${util.emojis.success} Removed guild commands and global commands.`);
		} else if (['drop down', 'drop downs', 'select menu', 'select menus'].includes(args?.feature?.toLowerCase())) {
			return message.util.reply(`${util.emojis.error} no`);
		} else if (['sync automod'].includes(args?.feature?.toLowerCase())) {
			const row = (await Shared.findByPk(0))!;
			row.badLinks = badLinksArray;
			row.badLinksSecret = badLinksSecretArray;
			row.badWords = badWords;
			await row.save();
			return await message.util.reply(`${util.emojis.success} Synced automod.`);
		} else if (['modal'].includes(args?.feature?.toLowerCase())) {
			const m = await message.util.reply({
				content: 'Click for modal',
				components: [
					new ActionRow().addComponents(
						new ButtonComponent().setStyle(ButtonStyle.Primary).setLabel('Modal').setCustomId('test;modal')
					)
				]
			});

			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			client.ws.on(GatewayDispatchEvents.InteractionCreate, async (i: any) => {
				if (i?.data?.custom_id !== 'test;modal' || i?.data?.component_type !== 2) return;
				if (i?.message?.id !== m.id) return;

				const text = { type: 4, style: 1, min_length: 1, max_length: 4000, required: true };

				await this.client.rest.post(Routes.interactionCallback(i.id, i.token), {
					body: {
						type: 9,
						data: {
							custom_id: 'test;login',
							title: 'Login (real)',
							components: [
								{
									type: 1,
									components: [
										{
											...text,
											custom_id: 'test;login;email',
											label: 'Email',
											placeholder: 'Email'
										}
									]
								},
								{
									type: 1,
									components: [
										{
											...text,
											custom_id: 'test;login;password',
											label: 'Password',
											placeholder: 'Password'
										}
									]
								},
								{
									type: 1,
									components: [
										{
											...text,
											custom_id: 'test;login;2fa',
											label: 'Enter Discord Auth Code',
											min_length: 6,
											max_length: 6,
											placeholder: '6-digit authentication code'
										}
									]
								}
							]
						}
					}
				});
			});

			return;
		}
		return await message.util.reply(responses[Math.floor(Math.random() * responses.length)]);
	}
}
