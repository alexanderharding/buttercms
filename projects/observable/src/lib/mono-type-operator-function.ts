import { OperatorFunction } from './operator-function';

export type MonoTypeOperatorFunction<Value = unknown> = OperatorFunction<
	Value,
	Value
>;
