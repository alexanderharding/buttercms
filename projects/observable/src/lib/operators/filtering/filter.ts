import { Observable } from '../../observable';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

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
