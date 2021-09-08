import {
	AllowedMentions,
	BushCommand,
	BushGuild,
	BushMessage,
	BushSlashMessage,
	BushUser,
	CanvasProgressBar,
	Level
} from '@lib';
import canvas from 'canvas';
import { MessageAttachment } from 'discord.js';
import got from 'got/dist/source';
import { join } from 'path';
import SimplifyNumber from 'simplify-number';

export default class LevelCommand extends BushCommand {
	public constructor() {
		super('level', {
			aliases: ['level', 'rank', 'lvl'],
			category: 'leveling',
			description: {
				content: 'Shows the level of a user',
				usage: 'level [user]',
				examples: ['level', 'level @Tyman']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to see the level of?',
						retry: '{error} Choose a valid user to see the level of.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'The user to get the level of',
					type: 'USER',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	private async getImage(user: BushUser, guild: BushGuild): Promise<Buffer> {
		// I added comments because this code is impossible to read
		const guildRows = await Level.findAll({ where: { guild: guild.id } });
		const rank = guildRows.sort((a, b) => b.xp - a.xp);
		const userLevelRow = guildRows.find((a) => a.user === user.id);
		if (!userLevelRow) throw new Error('User does not have a level');
		const userLevel = userLevelRow.level;
		const currentLevelXP = Level.convertLevelToXp(userLevel);
		const currentLevelXPProgress = userLevelRow.xp - currentLevelXP;
		const xpForNextLevel = Level.convertLevelToXp(userLevelRow.level + 1) - currentLevelXP;
		await user.fetch(true); // get accent color
		const white = '#FFFFFF',
			gray = '#23272A',
			highlight = user.hexAccentColor ?? '#5865F2';
		// Load roboto font because yes
		canvas.registerFont(join(__dirname, '..', '..', '..', '..', 'lib', 'assets', 'Roboto-Regular.ttf'), {
			family: 'Roboto'
		});
		// Create image canvas
		const image = canvas.createCanvas(800, 200),
			ctx = image.getContext('2d');
		// Fill background
		ctx.fillStyle = gray;
		ctx.fillRect(0, 0, image.width, image.height);
		// Draw avatar
		const avatarBuffer = await got.get(user.displayAvatarURL({ format: 'png', size: 128 })).buffer();
		const avatarImage = new canvas.Image();
		avatarImage.src = avatarBuffer;
		avatarImage.height = 128;
		avatarImage.width = 128;
		const imageTopCoord = image.height / 2 - avatarImage.height / 2;
		ctx.drawImage(avatarImage, imageTopCoord, imageTopCoord);
		// Write tag of user
		ctx.font = '30px Roboto';
		ctx.fillStyle = white;
		const measuredTag = ctx.measureText(user.tag);
		ctx.fillText(user.tag, avatarImage.width + 70, 60);
		// Draw line under tag
		ctx.fillStyle = highlight;
		ctx.fillRect(avatarImage.width + 70, 65 + measuredTag.actualBoundingBoxDescent, measuredTag.width, 3);
		// Draw leveling bar
		const fullProgressBar = new CanvasProgressBar(
			ctx,
			{
				x: avatarImage.width + 70,
				y: avatarImage.height - 0,
				height: 30,
				width: 550
			},
			white,
			1
		);
		fullProgressBar.draw();
		const progressBar = new CanvasProgressBar(
			ctx,
			{
				x: avatarImage.width + 70,
				y: avatarImage.height - 0,
				height: 30,
				width: 550
			},
			highlight,
			currentLevelXPProgress / xpForNextLevel
		);
		progressBar.draw();
		// Draw level data text
		ctx.fillStyle = white;
		ctx.fillText(
			`Level: ${userLevel}     XP: ${SimplifyNumber(currentLevelXPProgress)}/${SimplifyNumber(
				xpForNextLevel
			)}     Rank: ${SimplifyNumber(rank.indexOf(rank.find((x) => x.user === user.id)!) + 1)}`,
			avatarImage.width + 70,
			avatarImage.height - 20
		);
		// Return image in buffer form
		return image.toBuffer();
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { user?: BushUser }): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be run in a server.`);
		if (!(await message.guild.hasFeature('leveling')))
			return await message.util.reply(
				`${util.emojis.error} This command can only be run in commands with the leveling feature enabled.`
			);
		const user = args.user ?? message.author;
		try {
			return await message.util.reply({
				files: [new MessageAttachment(await this.getImage(user, message.guild!), 'level.png')]
			});
		} catch (e) {
			if (e instanceof Error && e.message === 'User does not have a level') {
				return await message.util.reply({
					content: `${util.emojis.error} ${user} does not have a level.`,
					allowedMentions: AllowedMentions.none()
				});
			} else throw e;
		}
	}
}
