import diceGrammar from '#lib/dice/dice-grammar.js';
import { generateRandomBigInt } from '#lib/utils/Utils.js';
import nearley from 'nearley';
import assert from 'node:assert';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import {
	BinaryExpression,
	Dice,
	Literal,
	Operator,
	Parenthesis,
	type DiceExpression,
	type DiceExpressionVisitor
} from './diceExpression.js';

const { Grammar, Parser } = nearley;

type EvaluationResult = [value: bigint, history: string];

const MAX_COUNT_HIST = 1_000;
const MAX_SIDES_HIST = 10_000;
const MAX_DICE_HIST_LEN = 1_000;
const MAX_COUNT = 100_000;

export class DiceExpressionEvaluator implements DiceExpressionVisitor<EvaluationResult> {
	public noHistory = false;

	public constructor(public readonly ignoreLimits = false) {}

	public visitDice(dice: Dice): EvaluationResult {
		let sum = 0n;
		const results: bigint[] = [];
		const hist = !this.noHistory && dice.sides <= MAX_SIDES_HIST && dice.count <= MAX_COUNT_HIST;

		if (!this.ignoreLimits && dice.count > MAX_COUNT) {
			throw new DiceEvaluationError(`Dice count cannot be greater than ${MAX_COUNT.toLocaleString()}`);
		}

		for (let i = 0; i < dice.count; i++) {
			if (dice.sides <= 1n) {
				throw new DiceEvaluationError(`Dice sides must be greater than 1, given ${dice.count}d${dice.sides}`);
			}

			const roll = generateRandomBigInt(dice.sides);
			sum += roll;
			if (hist) results.push(roll);
		}

		const history = maxLength(hist ? `[${results.join(', ')}] ` : '', MAX_DICE_HIST_LEN);

		if (history === '') this.noHistory = true;

		return [sum, `${history}${dice.count}d${dice.sides}`];
	}

	public visitLiteral(lit: Literal): EvaluationResult {
		return [lit.value, lit.value.toString()];
	}

	public visitBinaryExpression(binExpr: BinaryExpression): EvaluationResult {
		const [leftResult, leftStr] = binExpr.left.accept(this);
		const [rightResult, rightStr] = binExpr.right.accept(this);

		const result = this.calculate(binExpr.operator, leftResult, rightResult);

		return [result, `${leftStr} ${binExpr.operator} ${rightStr}`];
	}

	public visitParenthesis(paren: Parenthesis): EvaluationResult {
		const [exprResult, exprStr] = paren.expression.accept(this);

		return [exprResult, `(${exprStr})`];
	}

	private calculate(operator: Operator, left: bigint, right: bigint) {
		switch (operator) {
			case Operator.Add:
				return left + right;
			case Operator.Sub:
				return left - right;
			case Operator.Mul:
				return left * right;
			case Operator.Div:
				return left / right;
			default:
				throw new DiceEvaluationError(`Unsupported operator: ${operator}`);
		}
	}
}

function maxLength(str: string, len: number) {
	return str.length <= len ? str : '';
}

export function parseDiceNotation(phrase: string): DiceExpression | null {
	const parser = new Parser(Grammar.fromCompiled(diceGrammar));
	const res = parser.feed(phrase).finish();

	if (res.length === 0) return null;

	assert.equal(res.length, 1);

	return res[0];
}

/** **This can be very computationally expensive** */
export function evaluateDiceExpression(expr: DiceExpression, ignoreLimits = false): EvaluationResult {
	const evaluator = new DiceExpressionEvaluator(ignoreLimits);
	const [result, description] = expr.accept(evaluator);

	return [result, description];
}

export function evaluateDiceExpressionWorker(expr: DiceExpression, ignoreLimits = false): Promise<EvaluationResult> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(join(import.meta.dirname, './evalDiceWorker.js'));

		worker.on('message', (result) => {
			resolve(result);
			void worker.terminate();
		});

		worker.on('error', reject);

		worker.on('exit', (code) => {
			if (code !== 0) {
				reject(new DiceEvaluationError(`stopped with exit code ${code}`));
			}
		});

		worker.postMessage({ expr: expr.toData(), ignoreLimits });
	});
}

class DiceEvaluationError extends Error {}
