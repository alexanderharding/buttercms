/**
 * A function type interface that describes a function that accepts one parameter `In`
 * and returns another parameter `Out`.
 *
 * Usually used to describe OperatorFunction - it always takes a single
 * parameter (the source Observable) and returns another Observable.
 */
export type UnaryFunction<In = unknown, Out = unknown> = (value: In) => Out;
