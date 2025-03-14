import { noop } from 'rxjs';
import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

export function takeUntil<Input extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((subscriber) => {
			from(notifier).subscribe({
				...subscriber,
				next: () => subscriber.complete(),
				complete: noop,
			});
			if (subscriber.signal.aborted) return;
			from(source).subscribe(subscriber);
		});
}
