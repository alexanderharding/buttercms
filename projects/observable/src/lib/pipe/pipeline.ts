/**
 * A function type interface that describes a function that accepts one parameter `In`
 * and returns another parameter `Out`.
 *
 * Usually used to describe OperatorFunction - it always takes a single
 * parameter (the source Observable) and returns another Observable.
 */
export type UnaryFunction<In = unknown, Out = unknown> = (value: In) => Out;

export interface Pipeline<Value = unknown> {
	pipe(): Value;
	pipe<A>(op1: UnaryFunction<Value, A>): A;
	pipe<A, B>(op1: UnaryFunction<Value, A>, op2: UnaryFunction<A, B>): B;
	pipe<A, B, C>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
	): C;
	pipe<A, B, C, D>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
	): D;
	pipe<A, B, C, D, E>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
		op5: UnaryFunction<D, E>,
	): E;
	pipe<A, B, C, D, E, F>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
		op5: UnaryFunction<D, E>,
		op6: UnaryFunction<E, F>,
	): F;
	pipe<A, B, C, D, E, F, G>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
		op5: UnaryFunction<D, E>,
		op6: UnaryFunction<E, F>,
		op7: UnaryFunction<F, G>,
	): G;
	pipe<A, B, C, D, E, F, G, H>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
		op5: UnaryFunction<D, E>,
		op6: UnaryFunction<E, F>,
		op7: UnaryFunction<F, G>,
		op8: UnaryFunction<G, H>,
	): H;
	pipe<A, B, C, D, E, F, G, H, I>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
		op5: UnaryFunction<D, E>,
		op6: UnaryFunction<E, F>,
		op7: UnaryFunction<F, G>,
		op8: UnaryFunction<G, H>,
		op9: UnaryFunction<H, I>,
	): I;
	pipe<A, B, C, D, E, F, G, H, I>(
		op1: UnaryFunction<Value, A>,
		op2: UnaryFunction<A, B>,
		op3: UnaryFunction<B, C>,
		op4: UnaryFunction<C, D>,
		op5: UnaryFunction<D, E>,
		op6: UnaryFunction<E, F>,
		op7: UnaryFunction<F, G>,
		op8: UnaryFunction<G, H>,
		op9: UnaryFunction<H, I>,
		...operations: ReadonlyArray<UnaryFunction>
	): unknown;
}

export interface PipelineConstructor {
	new <Value>(value: Value): Pipeline<Value>;
	readonly prototype: Pipeline;
}

export const Pipeline: PipelineConstructor = class<Value> {
	/** @internal */
	readonly #value: Value;

	/** @internal */
	constructor(value: Value) {
		this.#value = value;
	}

	/** @internal */
	pipe(...operations: []): Value;
	pipe(...operations: []): unknown {
		return operations.reduce(
			(acc, operation: UnaryFunction) => operation(acc),
			this.#value,
		);
	}
};
