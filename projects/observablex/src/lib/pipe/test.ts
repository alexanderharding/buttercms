import { map } from '../operators';

import { UnaryFunction } from './unary-function';

type Pipe<T extends Array<UnaryFunction>> = T extends []
	? []
	: T extends [infer First]
		? First extends UnaryFunction<infer R, infer E>
			? [UnaryFunction<R, E>]
			: never
		: T extends [infer First, infer Second, ...infer Rest]
			? Rest extends Array<UnaryFunction>
				? First extends UnaryFunction<unknown, infer R>
					? Second extends UnaryFunction<unknown, infer E>
						? [First, ...Pipe<[UnaryFunction<R, E>, ...Rest]>]
						: never
					: never
				: never
			: never;

export type Piped = Pipe<
	[
		(value: string) => number,
		(value: string) => boolean,
		(value: string) => ReadableStream,
		(value: string) => RegExp,
		// (value: string) => number,
		// (value: number) => boolean,
		// (value: boolean) => Date,
		// (value: Date) => RegExp,
		// (value: RegExp) => Promise<string>,
		// (value: Promise<string>) => Set<number>,
		// (value: Set<number>) => Map<string, boolean>,
		// (value: Map<string, boolean>) => WeakMap<object, string>,
		// (value: WeakMap<object, string>) => symbol,
		// (value: symbol) => null,
		// (value: null) => undefined,
	]
>;

type Test<Fns extends Array<UnaryFunction>> = {
	[I in keyof Fns]: I extends '0' ? Fns['0'] : Aggregate<Fns['0'], Fns[I]>;
};

// type Aggregate<
// 	Acc extends Array<UnaryFunction>,
// 	Index extends number,
// > = Index extends 0
// 	? Acc[0]
// 	: Aggregate<
// 			[Acc[0], Acc[Index]],
// 			Index extends 1 ? 0 : Index extends 2 ? 1 : Index extends 3 ? 2 : never
// 		>;

// type Pipe<First extends UnaryFunction, Fns extends Array<UnaryFunction>> = (
// 	...args: [First, ...Fns]
// ) => ReturnType<Fns[0]>;

type Reduced<
	First extends UnaryFunction,
	Seed extends Array<UnaryFunction>,
> = Reduce<[], First>;

type Reduce<Acc extends Array<UnaryFunction>, Curr extends UnaryFunction> = [
	...Acc,
	Curr,
];

type Foo = typeof foo;
type Bar = typeof bar;
type Baz = typeof baz;

type Fn = (a: any) => any;

type Head<T extends Array<any>> = T extends [infer H, ...infer _] ? H : never;

type Last<T extends Array<any>> = T extends [infer _]
	? never
	: T extends [...infer _, infer Tl]
		? Tl
		: never;

type Allowed<T extends Array<Fn>, Cache extends Array<Fn> = []> = T extends []
	? Cache
	: T extends [infer Lst]
		? Lst extends Fn
			? Allowed<[], [...Cache, Lst]>
			: never
		: T extends [infer Fst, ...infer Lst]
			? Fst extends Fn
				? Lst extends Array<Fn>
					? Head<Lst> extends Fn
						? ReturnType<Fst> extends Head<Parameters<Head<Lst>>>
							? Allowed<Lst, [...Cache, Fst]>
							: never
						: never
					: never
				: never
			: never;

type FirstParameterOf<T extends Array<Fn>> =
	Head<T> extends Fn ? Head<Parameters<Head<T>>> : never;

type Return<T extends Array<Fn>> =
	Last<T> extends Fn ? ReturnType<Last<T>> : never;

function pipe<
	T extends Fn,
	Fns extends Array<T>,
	Allow extends {
		0: [never];
		1: [FirstParameterOf<Fns>];
	}[Allowed<Fns> extends never ? 0 : 1],
>(...args: [...Fns]): (...data: Allow) => Return<Fns>;

function pipe<T extends Fn, Fns extends Array<T>, Allow extends Array<unknown>>(
	...args: [...Fns]
) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return (...data: Allow) => args.reduce((acc, elem) => elem(acc), data);
}

const foo = (arg: string) => [1, 2, 3];
const baz = (arg: Array<number>) => 42;

const bar = (arg: number) => ['str'];

const check = pipe(
	map((x) => x + 1),
	baz,
	bar,
)(1); // string[]
const check3 = pipe(baz, bar)([2]); // string[]
const check2 = pipe(baz, bar)('hello'); // expected error
