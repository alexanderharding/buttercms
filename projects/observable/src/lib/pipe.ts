import { UnaryFunction } from './unary-function';

interface Pipeable<T> {
	pipe<T>(): UnaryFunction<T, T>;
	pipe<A, B>(op1: UnaryFunction<A, B>): UnaryFunction<A, B>;
	pipe<A, B, C>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
	): UnaryFunction<A, C>;
	pipe<A, B, C, D>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
	): D;
	pipe<A, B, C, D, E>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
	): E;
	pipe<A, B, C, D, E, F>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
		op5: UnaryFunction<E, F>,
	): F;
	pipe<A, B, C, D, E, F, G>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
		op5: UnaryFunction<E, F>,
		op6: UnaryFunction<F, G>,
	): G;
	pipe<A, B, C, D, E, F, G, H>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
		op5: UnaryFunction<E, F>,
		op6: UnaryFunction<F, G>,
		op7: UnaryFunction<G, H>,
	): H;
	pipe<A, B, C, D, E, F, G, H, I>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
		op5: UnaryFunction<E, F>,
		op6: UnaryFunction<F, G>,
		op7: UnaryFunction<G, H>,
		op8: UnaryFunction<H, I>,
	): I;
	pipe<A, B, C, D, E, F, G, H, I, J>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
		op5: UnaryFunction<E, F>,
		op6: UnaryFunction<F, G>,
		op7: UnaryFunction<G, H>,
		op8: UnaryFunction<H, I>,
		op9: UnaryFunction<I, J>,
	): J;
	pipe<A, B, C, D, E, F, G, H, I, J>(
		op1: UnaryFunction<A, B>,
		op2: UnaryFunction<B, C>,
		op3: UnaryFunction<C, D>,
		op4: UnaryFunction<D, E>,
		op5: UnaryFunction<E, F>,
		op6: UnaryFunction<F, G>,
		op7: UnaryFunction<G, H>,
		op8: UnaryFunction<H, I>,
		op9: UnaryFunction<I, J>,
		...operations: ReadonlyArray<UnaryFunction>
	): UnaryFunction;
}

export function pipeable<T>(source: T): Pipeable<T> {
	return {
		pipe: (...operations: ReadonlyArray<UnaryFunction>) =>
			operations.reduce((acc, operation) => operation(acc), source),
	};
}

export function pipe<A, B, C>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
): UnaryFunction<A, C>;
export function pipe<A, B, C, D>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
): D;
export function pipe<A, B, C, D, E>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
): E;
export function pipe<A, B, C, D, E, F>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
): F;
export function pipe<A, B, C, D, E, F, G>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
	op9: UnaryFunction<I, J>,
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
	op9: UnaryFunction<I, J>,
	...operations: ReadonlyArray<UnaryFunction>
): UnaryFunction;
export function pipe<T>(
	...operations: ReadonlyArray<UnaryFunction<T, T>>
): UnaryFunction<T, T>;
export function pipe(
	...operations: ReadonlyArray<UnaryFunction>
): UnaryFunction {
	return (source) =>
		operations.reduce((acc, operation) => operation(acc), source);
}
