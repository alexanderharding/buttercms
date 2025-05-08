import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
import { Observable } from '../../observable';
import { noop } from '../../noop';

const noValue = Symbol('no value');

export function debounce<T extends ObservableInput>(
	durationSelector: (
		value: ObservedValueOf<T>,
		index: number,
	) => ObservableInput,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	return (source) =>
		new Observable((dispatcher) => {
			if (dispatcher.signal.aborted) return;

			let lastValue: ObservedValueOf<T> | typeof noValue = noValue;
			let controller: AbortController | null;
			let index = 0;

			// Unsubscribe from duration notifier as soon as possible.
			dispatcher.signal.addEventListener('abort', () => setController(null), {
				once: true,
			});

			from(source).subscribe({
				...dispatcher,
				next: (value) =>
					from(durationSelector((lastValue = value), index++)).subscribe({
						...dispatcher,
						signal: setController(new AbortController()).signal,
						complete: noop,
						next: emit,
					}),
				complete() {
					// Source completed.
					// Emit any pending debounced values then complete
					emit();
					dispatcher.complete();
				},
				finally: () => (lastValue = noValue),
			});

			function setController<Value extends AbortController | null>(
				value: Value,
			): Value {
				controller?.abort();
				controller = value;
				return value;
			}

			function emit(): void {
				// null any current debounce controller we have,
				// we only cared about the first notification from it, and we
				// want to clean that subscription up as soon as possible.
				setController(null);
				if (lastValue === noValue) return;
				// We have a value! Free up memory first, then emit the value.
				const value = lastValue;
				lastValue = noValue;
				dispatcher.next(value);
			}
		});
}

export function debounce2<T extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	return (source) =>
		new Observable((dispatcher) => {
			let lastValue: ObservedValueOf<T> | typeof noValue = noValue;
			let controller: AbortController | null;

			from(source).subscribe({
				...dispatcher,
				next: (value) => {
					lastValue = value;
					from(notifier).subscribe({
						...dispatcher,
						signal: setController(new AbortController()).signal,
						complete: noop,
						next: emit,
					});
				},
				complete() {
					// Source completed.
					// Emit any pending debounced values then complete
					emit();
					dispatcher.complete();
				},
				finally() {
					lastValue = noValue;
					setController(null);
				},
			});

			function setController<Value extends AbortController | null>(
				value: Value,
			): Value {
				controller?.abort();
				controller = value;
				return value;
			}

			function emit(): void {
				// null any current debounce controller we have,
				// we only cared about the first notification from it, and we
				// want to clean that subscription up as soon as possible.
				setController(null);
				if (lastValue === noValue) return;
				// We have a value! Free up memory first, then emit the value.
				const value = lastValue;
				lastValue = noValue;
				dispatcher.next(value);
			}
		});
}
