import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

export function filter<Input extends ObservableInput>(
	predicate: (value: ObservedValueOf<Input>, index: number) => boolean,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((subscriber) => {
			// An index passed to our predicate function on each call.
			let index = 0;

			// Subscribe to the source, all errors and completions are
			// forwarded to the consumer.
			from(source).subscribe({
				...subscriber,
				next: (value) => predicate(value, index++) && subscriber.next(value),
			});
		});
}
