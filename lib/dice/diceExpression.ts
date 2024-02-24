import assert from 'node:assert/strict';

export const enum Operator {
	Add = '+',
	Sub = '-',
	Mul = '*',
	Div = '/'
}

export interface DiceExpression {
	accept<T>(visitor: DiceExpressionVisitor<T>): T;
	toData(): DiceExpressionData;
}

export type DiceExpressionData = DiceData | LiteralData | BinaryExpressionData | ParenthesisData;

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

	public toData(): DiceData {
		return { class: 'Dice', count: this.count, sides: this.sides };
	}
}

export interface DiceData {
	class: 'Dice';
	count: bigint;
	sides: bigint;
}

export class Literal implements DiceExpression {
	public constructor(public readonly value: bigint) {
		assert.equal(typeof value, 'bigint');
	}

	public accept<T>(visitor: DiceExpressionVisitor<T>): T {
		return visitor.visitLiteral(this);
	}

	public toData(): LiteralData {
		return { class: 'Literal', value: this.value };
	}
}

export interface LiteralData {
	class: 'Literal';
	value: bigint;
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

	public toData(): BinaryExpressionData {
		return { class: 'BinaryExpression', left: this.left.toData(), operator: this.operator, right: this.right.toData() };
	}
}

export interface BinaryExpressionData {
	class: 'BinaryExpression';
	left: DiceExpressionData;
	operator: Operator;
	right: DiceExpressionData;
}

export class Parenthesis implements DiceExpression {
	public constructor(public readonly expression: DiceExpression) {
		assert(isDiceExpression(expression));
	}

	public accept<T>(visitor: DiceExpressionVisitor<T>): T {
		return visitor.visitParenthesis(this);
	}

	public toData(): ParenthesisData {
		return { class: 'Parenthesis', expression: this.expression.toData() };
	}
}

export interface ParenthesisData {
	class: 'Parenthesis';
	expression: DiceExpressionData;
}

function isOperator(val: unknown): val is Operator {
	return val === Operator.Add || val === Operator.Sub || val === Operator.Mul || val === Operator.Div;
}

function isDiceExpression(val: unknown): val is DiceExpression {
	return val instanceof Dice || val instanceof Literal || val instanceof BinaryExpression || val instanceof Parenthesis;
}

export function fromData(data: DiceExpressionData): DiceExpression {
	switch (data.class) {
		case 'Dice':
			return new Dice(data.count, data.sides);
		case 'Literal':
			return new Literal(data.value);
		case 'BinaryExpression':
			return new BinaryExpression(fromData(data.left), data.operator, fromData(data.right));
		case 'Parenthesis':
			return new Parenthesis(fromData(data.expression));
	}
}
