import { any } from 'abort-signal-interop';
import { noop } from '../noop';
import {
	from,
	Observable,
	ObservableInput,
	ObservedValueOf,
} from '../observable';
import { UnaryFunction } from '../pipe';

export function skipUntil<Input extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((subscriber) => {
			let skip = true;

			const controller = new AbortController();
			const signal = any(controller.signal, subscriber.signal);
			controller.signal.addEventListener('abort', () => (skip = false), {
				signal,
			});

			from(notifier).subscribe({
				...subscriber,
				signal,
				next: () => controller.abort(),
				complete: noop,
			});

			from(source).subscribe({
				...subscriber,
				next: (value) => !skip && subscriber.next(value),
			});
		});
}
