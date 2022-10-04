import { BotClientEvents, BotListener, Emitter, emojis, handleAppealSubmit, TanzaniteEvent } from '#lib';

export default class ModalSubmitListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.ModalSubmit, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.ModalSubmit
		});
	}

	public async exec(...[interaction]: BotClientEvents[TanzaniteEvent.ModalSubmit]) {
		const { customId } = interaction;

		if (customId === 'test;login') {
			return interaction.reply({ content: `${emojis.loading} Selling your account information to Facebook...`, ephemeral: true });
		} else if (customId.startsWith('appeal_submit;')) {
			return handleAppealSubmit(interaction);
		}
	}
}
