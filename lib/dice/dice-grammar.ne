# this will be converted to ESM with rollup: https://github.com/kach/nearley/issues/535
@{%
// uses #lib/dice/diceExpression.js to trick rollup
const { Dice, Literal, BinaryExpression, Parenthesis, Operator } = require('#lib/dice/diceExpression.js');
%}

# https://nearley.js.org/docs/how-to-grammar-good#operator-precedence-is-not-black-magic

main -> expr {% id %}

expr -> expr opAddSub term {% (d) => new BinaryExpression(d[0], d[1], d[2]) %}
			| term {% id %}

term -> term opMulDiv factor {% (d) => new BinaryExpression(d[0], d[1], d[2]) %}
			| factor {% id %}

factor -> "(" expr ")" {% (d) => new Parenthesis(d[1]) %}
				| dice {% id %}
				| num {% (d) => new Literal(d[0]) %}

dice -> num:? "d" num {% (d) => new Dice(d[0] ? d[0] : 1n, d[2]) %}

num -> [1-9] [0-9]:* {% (d) => BigInt(d[0] + d[1].join('')) %}

opAddSub -> "+" {% () => Operator.Add %}
					| "-" {% () => Operator.Sub %}

opMulDiv -> "*" {% () => Operator.Mul %}
					| "x" {% () => Operator.Mul %}
					| "×" {% () => Operator.Mul %}
					| "/" {% () => Operator.Div %}
					| "÷" {% () => Operator.Div %}

