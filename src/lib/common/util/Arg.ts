import { Argument, ArgumentTypeCaster, Flag, ParsedValuePredicate, TypeResolver } from 'discord-akairo';
import { Message } from 'discord.js';
import { BushArgumentType } from '../..';

export class Arg {
	/**
	 * Casts a phrase to this argument's type.
	 * @param type - The type to cast to.
	 * @param resolver - The type resolver.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	public static cast(type: BushArgumentType, resolver: TypeResolver, message: Message, phrase: string): Promise<any> {
		return Argument.cast(type, resolver, message, phrase);
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the entire composition fails.
	 * @param types - Types to use.
	 */
	public static compose(...types: BushArgumentType[]): ArgumentTypeCaster {
		return Argument.compose(...types);
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the composition still continues with the failure passed on.
	 * @param types - Types to use.
	 */
	public static composeWithFailure(...types: BushArgumentType[]): ArgumentTypeCaster {
		return Argument.composeWithFailure(...types);
	}

	/**
	 * Checks if something is null, undefined, or a fail flag.
	 * @param value - Value to check.
	 */
	public static isFailure(value: any): value is null | undefined | (Flag & { value: any }) {
		return Argument.isFailure(value);
	}

	/**
	 * Creates a type from multiple types (product type).
	 * Only inputs where each type resolves with a non-void value are valid.
	 * @param types - Types to use.
	 */
	public static product(...types: BushArgumentType[]): ArgumentTypeCaster {
		return Argument.product(...types);
	}

	/**
	 * Creates a type where the parsed value must be within a range.
	 * @param type - The type to use.
	 * @param min - Minimum value.
	 * @param max - Maximum value.
	 * @param inclusive - Whether or not to be inclusive on the upper bound.
	 */
	public static range(type: BushArgumentType, min: number, max: number, inclusive?: boolean): ArgumentTypeCaster {
		return Argument.range(type, min, max, inclusive);
	}

	/**
	 * Creates a type that parses as normal but also tags it with some data.
	 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static tagged(type: BushArgumentType, tag?: any): ArgumentTypeCaster {
		return Argument.tagged(type, tag);
	}

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * Each type will also be tagged using `tagged` with themselves.
	 * @param types - Types to use.
	 */
	public static taggedUnion(...types: BushArgumentType[]): ArgumentTypeCaster {
		return Argument.taggedUnion(...types);
	}

	/**
	 * Creates a type that parses as normal but also tags it with some data and carries the original input.
	 * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static taggedWithInput(type: BushArgumentType, tag?: any): ArgumentTypeCaster {
		return Argument.taggedWithInput(type, tag);
	}

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * @param types - Types to use.
	 */
	public static union(...types: BushArgumentType[]): ArgumentTypeCaster {
		return Argument.union(...types);
	}

	/**
	 * Creates a type with extra validation.
	 * If the predicate is not true, the value is considered invalid.
	 * @param type - The type to use.
	 * @param predicate - The predicate function.
	 */
	public static validate(type: BushArgumentType, predicate: ParsedValuePredicate): ArgumentTypeCaster {
		return Argument.validate(type, predicate);
	}

	/**
	 * Creates a type that parses as normal but also carries the original input.
	 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 */
	public static withInput(type: BushArgumentType): ArgumentTypeCaster {
		return Argument.withInput(type);
	}
}
