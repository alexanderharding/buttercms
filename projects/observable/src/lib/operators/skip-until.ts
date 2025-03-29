import { noop } from '../noop';
import { Observable, ObservableInput, ObservedValueOf } from '../observable';
import { Pipeline, UnaryFunction } from '../pipe';
import { filter } from './filter';
import { take } from './take';

export function skipUntil<Input extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((subscriber) => {
			let skip = true;

			new Pipeline(notifier).pipe(take(1)).subscribe({
				...subscriber,
				next: () => (skip = false),
				error: (error) => subscriber.error(error),
				complete: noop,
			});

			new Pipeline(source).pipe(filter(() => !skip)).subscribe(subscriber);
		});
}
