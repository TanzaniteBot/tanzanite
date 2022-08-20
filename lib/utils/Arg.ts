import {
	type BaseBushArgumentType,
	type BushArgumentType,
	type BushArgumentTypeCaster,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { Argument, type Command, type Flag, type ParsedValuePredicate } from 'discord-akairo';
import { type Message } from 'discord.js';

/**
 * Casts a phrase to this argument's type.
 * @param type - The type to cast to.
 * @param message - Message that called the command.
 * @param phrase - Phrase to process.
 */
export async function cast<T extends ATC>(type: T, message: CommandMessage | SlashMessage, phrase: string): Promise<ATCR<T>>;
export async function cast<T extends KBAT>(type: T, message: CommandMessage | SlashMessage, phrase: string): Promise<BAT[T]>;
export async function cast(type: AT | ATC, message: CommandMessage | SlashMessage, phrase: string): Promise<any>;
export async function cast(
	this: ThisType<Command>,
	type: ATC | AT,
	message: CommandMessage | SlashMessage,
	phrase: string
): Promise<any> {
	return Argument.cast.call(this, type as any, message.client.commandHandler.resolver, message as Message, phrase);
}

/**
 * Creates a type that is the left-to-right composition of the given types.
 * If any of the types fails, the entire composition fails.
 * @param types - Types to use.
 */
export function compose<T extends ATC>(...types: T[]): ATCATCR<T>;
export function compose<T extends KBAT>(...types: T[]): ATCBAT<T>;
export function compose(...types: (AT | ATC)[]): ATC;
export function compose(...types: (AT | ATC)[]): ATC {
	return Argument.compose(...(types as any));
}

/**
 * Creates a type that is the left-to-right composition of the given types.
 * If any of the types fails, the composition still continues with the failure passed on.
 * @param types - Types to use.
 */
export function composeWithFailure<T extends ATC>(...types: T[]): ATCATCR<T>;
export function composeWithFailure<T extends KBAT>(...types: T[]): ATCBAT<T>;
export function composeWithFailure(...types: (AT | ATC)[]): ATC;
export function composeWithFailure(...types: (AT | ATC)[]): ATC {
	return Argument.composeWithFailure(...(types as any));
}

/**
 * Checks if something is null, undefined, or a fail flag.
 * @param value - Value to check.
 */
export function isFailure(value: any): value is null | undefined | (Flag & { value: any }) {
	return Argument.isFailure(value);
}

/**
 * Creates a type from multiple types (product type).
 * Only inputs where each type resolves with a non-void value are valid.
 * @param types - Types to use.
 */
export function product<T extends ATC>(...types: T[]): ATCATCR<T>;
export function product<T extends KBAT>(...types: T[]): ATCBAT<T>;
export function product(...types: (AT | ATC)[]): ATC;
export function product(...types: (AT | ATC)[]): ATC {
	return Argument.product(...(types as any));
}

/**
 * Creates a type where the parsed value must be within a range.
 * @param type - The type to use.
 * @param min - Minimum value.
 * @param max - Maximum value.
 * @param inclusive - Whether or not to be inclusive on the upper bound.
 */
export function range<T extends ATC>(type: T, min: number, max: number, inclusive?: boolean): ATCATCR<T>;
export function range<T extends KBAT>(type: T, min: number, max: number, inclusive?: boolean): ATCBAT<T>;
export function range(type: AT | ATC, min: number, max: number, inclusive?: boolean): ATC;
export function range(type: AT | ATC, min: number, max: number, inclusive?: boolean): ATC {
	return Argument.range(type as any, min, max, inclusive);
}

/**
 * Creates a type that parses as normal but also tags it with some data.
 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
 * @param type - The type to use.
 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
 */
export function tagged<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
export function tagged<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
export function tagged(type: AT | ATC, tag?: any): ATC;
export function tagged(type: AT | ATC, tag?: any): ATC {
	return Argument.tagged(type as any, tag);
}

/**
 * Creates a type from multiple types (union type).
 * The first type that resolves to a non-void value is used.
 * Each type will also be tagged using `tagged` with themselves.
 * @param types - Types to use.
 */
export function taggedUnion<T extends ATC>(...types: T[]): ATCATCR<T>;
export function taggedUnion<T extends KBAT>(...types: T[]): ATCBAT<T>;
export function taggedUnion(...types: (AT | ATC)[]): ATC;
export function taggedUnion(...types: (AT | ATC)[]): ATC {
	return Argument.taggedUnion(...(types as any));
}

/**
 * Creates a type that parses as normal but also tags it with some data and carries the original input.
 * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
 * @param type - The type to use.
 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
 */
export function taggedWithInput<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
export function taggedWithInput<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
export function taggedWithInput(type: AT | ATC, tag?: any): ATC;
export function taggedWithInput(type: AT | ATC, tag?: any): ATC {
	return Argument.taggedWithInput(type as any, tag);
}

/**
 * Creates a type from multiple types (union type).
 * The first type that resolves to a non-void value is used.
 * @param types - Types to use.
 */
export function union<T extends ATC>(...types: T[]): ATCATCR<T>;
export function union<T extends KBAT>(...types: T[]): ATCBAT<T>;
export function union(...types: (AT | ATC)[]): ATC;
export function union(...types: (AT | ATC)[]): ATC {
	return Argument.union(...(types as any));
}

/**
 * Creates a type with extra validation.
 * If the predicate is not true, the value is considered invalid.
 * @param type - The type to use.
 * @param predicate - The predicate function.
 */
export function validate<T extends ATC>(type: T, predicate: ParsedValuePredicate): ATCATCR<T>;
export function validate<T extends KBAT>(type: T, predicate: ParsedValuePredicate): ATCBAT<T>;
export function validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC;
export function validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC {
	return Argument.validate(type as any, predicate);
}

/**
 * Creates a type that parses as normal but also carries the original input.
 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
 * @param type - The type to use.
 */
export function withInput<T extends ATC>(type: T): ATC<ATCR<T>>;
export function withInput<T extends KBAT>(type: T): ATCBAT<T>;
export function withInput(type: AT | ATC): ATC;
export function withInput(type: AT | ATC): ATC {
	return Argument.withInput(type as any);
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
