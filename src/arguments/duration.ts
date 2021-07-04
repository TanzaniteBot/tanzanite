import { BushArgumentTypeCaster, BushMessage } from '../lib';

export const durationTypeCaster: BushArgumentTypeCaster = (_message: BushMessage, phrase): number => {
	// if (!phrase) return null;
	// const regexString = Object.entries(BushConstants.TimeUnits)
	// 	.map(([name, { label }]) => String.raw`(?:(?<${name}>-?(?:\d+)?\.?\d+) *${label})?`)
	// 	.join('\\s*');
	// const match = new RegExp(`^${regexString}$`, 'im').exec(phrase);
	// if (!match) return null;
	// let milliseconds = 0;
	// for (const key in match.groups) {
	// 	const value = Number(match.groups[key] || 0);
	// 	milliseconds += value * BushConstants.TimeUnits[key].value;
	// }
	// return milliseconds;

	return client.util.parseDuration(phrase).duration;
};
