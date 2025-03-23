import { noop } from 'rxjs';
import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { Observable } from '../observable/observable';
import { UnaryFunction } from '../pipe/unary-function';

/**
 * A pipeable operator that completes the returned {@linkcode Observable} when the
 * {@linkcode notifier} (that is converted to an {@linkcode Observable}) emits it's
 * first next notification, if any. The `complete` notification from the
 * {@linkcode notifier} is ignored but the `error` notification is not.
 */
export function takeUntil<Input extends ObservableInput>(
	notifier: ObservableInput,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((subscriber) => {
			// Subscribe to the notifier and complete the source when it
			// pushes the next notification.
			from(notifier).subscribe({
				...subscriber,
				next: () => subscriber.complete(),
				// Ignore complete notifications from the notifier.
				complete: noop,
			});

			// If the subscriber has already been aborted,
			// there's nothing to do.
			if (subscriber.signal.aborted) return;

			// Subscribe to the source and pass through notifications.
			from(source).subscribe(subscriber);
		});
}
