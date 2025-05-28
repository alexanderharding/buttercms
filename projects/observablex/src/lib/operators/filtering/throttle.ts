import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
import { Observable } from '../../observable';
import { noop } from '../../noop';

const noValue = Symbol('no value');

export function debounce<T extends ObservableInput>(
	durationSelector: (value: ObservedValueOf<T>) => ObservableInput,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	return (source) =>
		new Observable((observer) => {
			let lastValue: ObservedValueOf<T> | typeof noValue = noValue;
			let controller: AbortController | null;

			from(source).subscribe({
				...observer,
				next: (value) =>
					from(durationSelector((lastValue = value))).subscribe({
						...observer,
						signal: setController(new AbortController()).signal,
						complete: noop,
						next: emit,
					}),
				complete() {
					// Source completed.
					// Emit any pending debounced values then complete
					emit();
					observer.complete();
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
				observer.next(value);
			}
		});
}

export function debounce2<T extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<T, Observable<ObservedValueOf<T>>> {
	return (source) =>
		new Observable((observer) => {
			let lastValue: ObservedValueOf<T> | typeof noValue = noValue;
			let controller: AbortController | null;

			from(source).subscribe({
				...observer,
				next: (value) => {
					lastValue = value;
					from(notifier).subscribe({
						...observer,
						signal: setController(new AbortController()).signal,
						complete: noop,
						next: emit,
					});
				},
				complete() {
					// Source completed.
					// Emit any pending debounced values then complete
					emit();
					observer.complete();
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
				observer.next(value);
			}
		});
}
