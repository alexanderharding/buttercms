import { Pipeline } from './pipeline';
import { UnaryFunction } from './unary-function';

export function pipe<T>(): UnaryFunction<T, T>;
export function pipe<A, B>(op1: UnaryFunction<A, B>): UnaryFunction<A, B>;
export function pipe<A, B, C>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
): UnaryFunction<A, C>;
export function pipe<A, B, C, D>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
): UnaryFunction<A, D>;
export function pipe<A, B, C, D, E>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
): UnaryFunction<A, E>;
export function pipe<A, B, C, D, E, F>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
): UnaryFunction<A, F>;
export function pipe<A, B, C, D, E, F, G>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
): UnaryFunction<A, G>;
export function pipe<A, B, C, D, E, F, G, H>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
): UnaryFunction<A, H>;
export function pipe<A, B, C, D, E, F, G, H, I>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
): UnaryFunction<A, I>;
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
): UnaryFunction<A, J>;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
	op9: UnaryFunction<I, J>,
	op10: UnaryFunction<J, K>,
): UnaryFunction<A, K>;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
	op9: UnaryFunction<I, J>,
	op10: UnaryFunction<J, K>,
	op11: UnaryFunction<K, L>,
): UnaryFunction<A, L>;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M>(
	op1: UnaryFunction<A, B>,
	op2: UnaryFunction<B, C>,
	op3: UnaryFunction<C, D>,
	op4: UnaryFunction<D, E>,
	op5: UnaryFunction<E, F>,
	op6: UnaryFunction<F, G>,
	op7: UnaryFunction<G, H>,
	op8: UnaryFunction<H, I>,
	op9: UnaryFunction<I, J>,
	op10: UnaryFunction<J, K>,
	op11: UnaryFunction<K, L>,
	op12: UnaryFunction<L, M>,
): UnaryFunction<A, M>;

// export function pipe<A, B, C, D, E, F, G, H, I, J>(
// 	op1: UnaryFunction<A, B>,
// 	op2: UnaryFunction<B, C>,
// 	op3: UnaryFunction<C, D>,
// 	op4: UnaryFunction<D, E>,
// 	op5: UnaryFunction<E, F>,
// 	op6: UnaryFunction<F, G>,
// 	op7: UnaryFunction<G, H>,
// 	op8: UnaryFunction<H, I>,
// 	op9: UnaryFunction<I, J>,
// 	...operations: ReadonlyArray<UnaryFunction>
// ): UnaryFunction;
export function pipe<T>(
	...operations: ReadonlyArray<UnaryFunction<T, T>>
): UnaryFunction<T, T>;
export function pipe(...operations: []): UnaryFunction {
	return (source) => new Pipeline(source).pipe(...operations);
}
