import assert from 'node:assert/strict';

export const enum Operator {
	Add = '+',
	Sub = '-',
	Mul = '*',
	Div = '/'
}

export interface DiceExpression {
	accept<T>(visitor: DiceExpressionVisitor<T>): T;
}

export interface DiceExpressionVisitor<T> {
	visitDice(dice: Dice): T;
	visitLiteral(lit: Literal): T;
	visitBinaryExpression(binExpr: BinaryExpression): T;
	visitParenthesis(paren: Parenthesis): T;
}

export class Dice implements DiceExpression {
	public constructor(
		public readonly count: bigint,
		public readonly sides: bigint
	) {
		assert.equal(typeof count, 'bigint');
		assert.equal(typeof sides, 'bigint');
	}

	public accept<T>(visitor: DiceExpressionVisitor<T>): T {
		return visitor.visitDice(this);
	}
}

export class Literal implements DiceExpression {
	public constructor(public readonly value: bigint) {
		assert.equal(typeof value, 'bigint');
	}

	public accept<T>(visitor: DiceExpressionVisitor<T>): T {
		return visitor.visitLiteral(this);
	}
}

export class BinaryExpression implements DiceExpression {
	public constructor(
		public readonly left: DiceExpression,
		public readonly operator: Operator,
		public readonly right: DiceExpression
	) {
		assert(isDiceExpression(left));
		assert(isOperator(operator));
		assert(isDiceExpression(right));
	}

	public accept<T>(visitor: DiceExpressionVisitor<T>): T {
		return visitor.visitBinaryExpression(this);
	}
}

export class Parenthesis implements DiceExpression {
	public constructor(public readonly expression: DiceExpression) {
		assert(isDiceExpression(expression));
	}

	public accept<T>(visitor: DiceExpressionVisitor<T>): T {
		return visitor.visitParenthesis(this);
	}
}

function isOperator(val: unknown): val is Operator {
	return val === Operator.Add || val === Operator.Sub || val === Operator.Mul || val === Operator.Div;
}

function isDiceExpression(val: unknown): val is DiceExpression {
	return val instanceof Dice || val instanceof Literal || val instanceof BinaryExpression || val instanceof Parenthesis;
}
