import { Observable } from '../../observable';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
import { filter } from './filter';
import { take } from './take';
import { noop } from '../../noop';

export function skipUntil<Input extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((observer) => {
			let skip = true;

			from(notifier)
				.pipe(take(1))
				.subscribe({
					...observer,
					next: () => (skip = false),
					error: (error) => observer.error(error),
					// Ignore complete notifications from the notifier.
					complete: noop,
				});

			from(source)
				.pipe(filter(() => !skip))
				.subscribe(observer);
		});
}
