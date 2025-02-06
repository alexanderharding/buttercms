import { Observable } from './observable';
import { UnaryFunction } from './unary-function';

export type OperatorFunction<In = unknown, Out = unknown> = UnaryFunction<
	Observable<In>,
	Observable<Out>
>;
