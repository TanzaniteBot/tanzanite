import type { BotArgumentTypeCaster } from '#lib';
import { TinyColor } from '@ctrl/tinycolor';

export const tinyColor: BotArgumentTypeCaster<string | null> = (_message, phrase) => {
	// if the phase is a number it converts it to hex incase it could be representing a color in decimal
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const newPhase = isNaN(phrase as any) ? phrase : `#${Number(phrase).toString(16)}`;
	return new TinyColor(newPhase).isValid ? newPhase : null;
};
