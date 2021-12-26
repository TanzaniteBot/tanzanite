import { BaseBushArgumentType, BushArgumentTypeCaster, BushSlashMessage, type BushArgumentType } from '#lib';
import { Argument, type Flag, type ParsedValuePredicate } from 'discord-akairo';
import { type Message } from 'discord.js';

/**
 * A wrapper for the {@link Argument} class that adds custom typings.
 */
export class Arg {
	/**
	 * Casts a phrase to this argument's type.
	 * @param type - The type to cast to.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	public static async cast<T extends ATC>(type: T, message: Message | BushSlashMessage, phrase: string): Promise<ATCR<T>>;
	public static async cast<T extends KBAT>(type: T, message: Message | BushSlashMessage, phrase: string): Promise<BAT[T]>;
	public static async cast(type: AT | ATC, message: Message | BushSlashMessage, phrase: string): Promise<any>;
	public static async cast(type: ATC | AT, message: Message | BushSlashMessage, phrase: string): Promise<any> {
		return Argument.cast(type as any, client.commandHandler.resolver, message as Message, phrase);
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the entire composition fails.
	 * @param types - Types to use.
	 */
	public static compose<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static compose<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static compose(...types: (AT | ATC)[]): ATC;
	public static compose(...types: (AT | ATC)[]): ATC {
		return Argument.compose(...(types as any));
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the composition still continues with the failure passed on.
	 * @param types - Types to use.
	 */
	public static composeWithFailure<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static composeWithFailure<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static composeWithFailure(...types: (AT | ATC)[]): ATC;
	public static composeWithFailure(...types: (AT | ATC)[]): ATC {
		return Argument.composeWithFailure(...(types as any));
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
	public static product<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static product<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static product(...types: (AT | ATC)[]): ATC;
	public static product(...types: (AT | ATC)[]): ATC {
		return Argument.product(...(types as any));
	}

	/**
	 * Creates a type where the parsed value must be within a range.
	 * @param type - The type to use.
	 * @param min - Minimum value.
	 * @param max - Maximum value.
	 * @param inclusive - Whether or not to be inclusive on the upper bound.
	 */
	public static range<T extends ATC>(type: T, min: number, max: number, inclusive?: boolean): ATCATCR<T>;
	public static range<T extends KBAT>(type: T, min: number, max: number, inclusive?: boolean): ATCBAT<T>;
	public static range(type: AT | ATC, min: number, max: number, inclusive?: boolean): ATC;
	public static range(type: AT | ATC, min: number, max: number, inclusive?: boolean): ATC {
		return Argument.range(type as any, min, max, inclusive);
	}

	/**
	 * Creates a type that parses as normal but also tags it with some data.
	 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static tagged<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
	public static tagged<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
	public static tagged(type: AT | ATC, tag?: any): ATC;
	public static tagged(type: AT | ATC, tag?: any): ATC {
		return Argument.tagged(type as any, tag);
	}

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * Each type will also be tagged using `tagged` with themselves.
	 * @param types - Types to use.
	 */
	public static taggedUnion<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static taggedUnion<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static taggedUnion(...types: (AT | ATC)[]): ATC;
	public static taggedUnion(...types: (AT | ATC)[]): ATC {
		return Argument.taggedUnion(...(types as any));
	}

	/**
	 * Creates a type that parses as normal but also tags it with some data and carries the original input.
	 * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static taggedWithInput<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
	public static taggedWithInput<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
	public static taggedWithInput(type: AT | ATC, tag?: any): ATC;
	public static taggedWithInput(type: AT | ATC, tag?: any): ATC {
		return Argument.taggedWithInput(type as any, tag);
	}

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * @param types - Types to use.
	 */
	public static union<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static union<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static union(...types: (AT | ATC)[]): ATC;
	public static union(...types: (AT | ATC)[]): ATC {
		return Argument.union(...(types as any));
	}

	/**
	 * Creates a type with extra validation.
	 * If the predicate is not true, the value is considered invalid.
	 * @param type - The type to use.
	 * @param predicate - The predicate function.
	 */
	public static validate<T extends ATC>(type: T, predicate: ParsedValuePredicate): ATCATCR<T>;
	public static validate<T extends KBAT>(type: T, predicate: ParsedValuePredicate): ATCBAT<T>;
	public static validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC;
	public static validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC {
		return Argument.validate(type as any, predicate);
	}

	/**
	 * Creates a type that parses as normal but also carries the original input.
	 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 */
	public static withInput<T extends ATC>(type: T): ATC<ATCR<T>>;
	public static withInput<T extends KBAT>(type: T): ATCBAT<T>;
	public static withInput(type: AT | ATC): ATC;
	public static withInput(type: AT | ATC): ATC {
		return Argument.withInput(type as any);
	}
}

type BushArgumentTypeCasterReturn<R> = R extends BushArgumentTypeCaster<infer S> ? S : R;
/** ```ts
 * <R = unknown> = BushArgumentTypeCaster<R>
 * ``` */
type ATC<R = unknown> = BushArgumentTypeCaster<R>;
/** ```ts
 * keyof BaseBushArgumentType
 * ``` */
type KBAT = keyof BaseBushArgumentType;
/** ```ts
 * <R> = BushArgumentTypeCasterReturn<R>
 * ``` */
type ATCR<R> = BushArgumentTypeCasterReturn<R>;
/** ```ts
 * BushArgumentType
 * ``` */
type AT = BushArgumentType;
/** ```ts
 * BaseBushArgumentType
 * ``` */
type BAT = BaseBushArgumentType;

/** ```ts
 * <T extends BushArgumentTypeCaster> = BushArgumentTypeCaster<BushArgumentTypeCasterReturn<T>>
 * ``` */
type ATCATCR<T extends BushArgumentTypeCaster> = BushArgumentTypeCaster<BushArgumentTypeCasterReturn<T>>;
/** ```ts
 * <T extends keyof BaseBushArgumentType> = BushArgumentTypeCaster<BaseBushArgumentType[T]>
 * ``` */
type ATCBAT<T extends keyof BaseBushArgumentType> = BushArgumentTypeCaster<BaseBushArgumentType[T]>;
