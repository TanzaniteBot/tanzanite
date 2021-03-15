import chalk from 'chalk';
import functions from './functions';

function verbose(header: string, content: string): void {
	console.info(`${chalk.bgGrey(functions.timeStamp())} ${chalk.grey(`[${header}]`)} ${content}`);
}

function info(header: string, content: string): void {
	console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan(`[${header}]`)} ${content}`);
}

function warn(header: string, content: string): void {
	console.warn(`${chalk.bgYellow(functions.timeStamp())} ${chalk.yellow(`[${header}]`)} ${content}`);
}

function error(header: string, content: string): void {
	console.error(`${chalk.bgRedBright(functions.timeStamp())} ${chalk.redBright(`[${header}]`)} ${content}`);
}

function success(content: string): void {
	console.log(`${chalk.bgGreen(functions.timeStamp())} ${content}`);
}

export = {
	verbose,
	info,
	warn,
	error
};
