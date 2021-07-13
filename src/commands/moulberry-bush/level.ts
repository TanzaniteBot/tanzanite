import { BushCommand, BushMessage, BushSlashMessage, BushUser, Level } from '@lib';
/*
import canvas from 'canvas';
import { MessageAttachment } from 'discord.js';
import { join } from 'path';
import got from 'got/dist/source';
import { CanvasProgressBar } from '@lib';
*/

export default class LevelCommand extends BushCommand {
	public constructor() {
		super('level', {
			aliases: ['level', 'rank'],
			category: "Moulberry's Bush",
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
			slash: true
		});
	}

	/* private simplifyXP(xp: number): string {

	}

	private async getImage(user: User): Promise<Buffer> {
		// I added comments because this code is impossible to read
		const [userLevelRow] = await Level.findOrBuild({
			where: {
				id: user.id
			},
			defaults: {
				id: user.id
			}
		});
		const userLevel = userLevelRow.level
		const currentLevelXP = Level.convertLevelToXp(userLevel);
		const currentLevelXPProgress = userLevelRow.xp - currentLevelXP;
		const xpForNextLevel =
			Level.convertLevelToXp(userLevelRow.level + 1) - currentLevelXP;
		// Load roboto font because yes
		canvas.registerFont(
			join(__dirname, '..', '..', '..', 'Roboto-Regular.ttf'),
			{
				family: 'Roboto'
			}
		);
		// Create image canvas
		const image = canvas.createCanvas(800, 200),
			ctx = image.getContext('2d');
		// Fill background
		ctx.fillStyle = '#00c7eb';
		ctx.fillRect(0, 0, image.width, image.height);
		// Draw avatar
		const avatarBuffer = await got
			.get(user.displayAvatarURL({ format: 'png', size: 128 }))
			.buffer();
		const avatarImage = new canvas.Image();
		avatarImage.src = avatarBuffer;
		avatarImage.height = 128
		avatarImage.width = 128
		const imageTopCoord = (image.height / 2) - (avatarImage.height / 2)
		ctx.drawImage(avatarImage, imageTopCoord, imageTopCoord);
		// Write tag of user
		ctx.font = '30px Roboto';
		ctx.fillStyle = 'black';
		const measuredTag = ctx.measureText(user.tag);
		ctx.fillText(user.tag, avatarImage.width + 70, 60);
		// Draw line under tag
		ctx.fillStyle = 'yellow';
		ctx.fillRect(
			avatarImage.width + 70,
			65 + measuredTag.actualBoundingBoxDescent,
			measuredTag.width,
			3
		);
		// Draw leveling bar
		const fullProgressBar = new CanvasProgressBar(
			ctx,
			{
				x: avatarImage.width + 70,
				y: avatarImage.height - 10,
				height: 30,
				width: 550
			},
			'#6e6e6e',
			1
		);
		fullProgressBar.draw();
		const progressBar = new CanvasProgressBar(
			ctx,
			{
				x: avatarImage.width + 70,
				y: avatarImage.height - 10,
				height: 30,
				width: 550
			},
			'yellow',
			currentLevelXPProgress / xpForNextLevel
		);
		progressBar.draw();
		// Draw level data text
		ctx.fillStyle = 'black'
		ctx.fillText(`Level: ${userLevel} XP: $`, avatarImage.width + 70, avatarImage.height - 20)
		// Return image in buffer form
		return image.toBuffer();
	} */

	private async getResponse(user: BushUser): Promise<string> {
		const userLevelRow = await Level.findByPk(user.id);
		if (userLevelRow) {
			return `${user ? `${user.tag}'s` : 'Your'} level is ${userLevelRow.level} (${userLevelRow.xp} XP)`;
		} else {
			return `${user ? `${user.tag} does` : 'You do'} not have a level yet!`;
		}
	}

	async exec(message: BushMessage | BushSlashMessage, { user }: { user?: BushUser }): Promise<void> {
		// await message.reply(
		// 	new MessageAttachment(
		// 		await this.getImage(user || message.author),
		// 		'lel.png'
		// 	)
		// );
		await message.reply(await this.getResponse(user || message.author));
	}
}
