import chalk from 'chalk';
import functions from '../../constants/functions';

function parseColors(content: string, color: 'blueBright' | 'blackBright'): string {
	const newContent: Array<string> = content.split(/<<|>>/);
	const a: Array<string> = [];
	for (let i = 0; i < newContent.length; i++) {
		if (i % 2 !== 0) {
			switch (color) {
				case 'blackBright': {
					a.push(chalk.blackBright(newContent[i]));
					break;
				}
				case 'blueBright': {
					a.push(chalk.blueBright(newContent[i]));
					break;
				}
			}
		} else {
			a.push(newContent[i]);
		}
	}
	return a.join('');
}

function debug(content: unknown): void {
	return console.log(`${chalk.bgGrey(functions.timeStamp())} ${chalk.grey('[Debug]')} ${content}`);
}

function verbose(header: string, content: string): void {
	return console.info(`${chalk.bgGrey(functions.timeStamp())} ${chalk.grey(`[${header}]`)} ${parseColors(content, 'blackBright')}`);
}

function info(header: string, content: string): void {
	return console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan(`[${header}]`)} ${parseColors(content, 'blueBright')}`);
}

function warn(header: string, content: string): void {
	return console.warn(`${chalk.bgYellow(functions.timeStamp())} ${chalk.yellow(`[${header}]`)} ${parseColors(content, 'blueBright')}`);
}

function error(header: string, content: string): void {
	return console.error(`${chalk.bgRedBright(functions.timeStamp())} ${chalk.redBright(`[${header}]`)} ${parseColors(content, 'blueBright')}`);
}

function success(header: string, content: string): void {
	return console.log(`${chalk.bgGreen(functions.timeStamp())} ${chalk.green(`[${header}]`)} ${parseColors(content, 'blueBright')}`);
}

export = {
	debug,
	verbose,
	info,
	warn,
	error,
	success
};
