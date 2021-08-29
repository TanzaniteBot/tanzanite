import { BushCommand, BushGuild, BushMessage, BushSlashMessage, BushUser, CanvasProgressBar, Level } from '@lib';
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
			slashOptions: [
				{
					name: 'user',
					description: 'The user to get the level of',
					type: 'USER',
					required: false
				}
			],
			slash: true,
			channel: 'guild'
		});
	}

	private async getImage(user: BushUser, guild: BushGuild): Promise<Buffer> {
		// I added comments because this code is impossible to read
		const [userLevelRow] = await Level.findOrBuild({
			where: {
				user: user.id,
				guild: guild.id
			},
			defaults: {
				user: user.id,
				guild: guild.id
			}
		});
		const rank = (await Level.findAll({ where: { guild: guild.id } })).sort((a, b) => b.xp - a.xp);
		const userLevel = userLevelRow.level;
		const currentLevelXP = Level.convertLevelToXp(userLevel);
		const currentLevelXPProgress = userLevelRow.xp - currentLevelXP;
		const xpForNextLevel = Level.convertLevelToXp(userLevelRow.level + 1) - currentLevelXP;
		const white = '#FFFFFF',
			gray = '#23272A',
			newBlurple = '#5865F2';
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
		ctx.fillStyle = newBlurple;
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
			newBlurple,
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
		return await message.reply({
			files: [new MessageAttachment(await this.getImage(args.user ?? message.author, message.guild!), 'level.png')]
		});
	}
}
