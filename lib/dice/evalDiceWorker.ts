/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { parentPort } from 'worker_threads';
import { fromData } from './diceExpression.js';
import { evaluateDiceExpression } from './evalDice.js';

parentPort!.on('message', ({ expr, ignoreLimits }) => {
	const diceExpr = fromData(expr);
	const result = evaluateDiceExpression(diceExpr, ignoreLimits);

	// send result to main thread
	parentPort!.postMessage(result);
});
