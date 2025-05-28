import { Observable } from '../../observable';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export function distinctUntilChanged<Input extends ObservableInput>(
	comparator: (
		previous: ObservedValueOf<Input>,
		current: ObservedValueOf<Input>,
	) => boolean = (previous, current) => previous === current,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((observer) => {
			// The previous value, used to compare against values selected
			// from new arrivals to determine "distinctiveness".
			let previous: ObservedValueOf<Input>;
			// Whether or not this is the first value we've gotten.
			let first = true;

			from(source).subscribe({
				...observer,
				next: (current) => {
					// If it's the first value, we always emit it.
					// Otherwise, we compare this value to the previous value, and
					// if the comparer returns false, we emit.
					if (!first && comparator(previous, current)) return;
					// Update our state *before* we emit the value
					// as emission can be the source of reentrant code
					// in functional libraries like this. We only really
					// need to do this if it's the first value, or if the
					// value we're tracking in previous needs to change.
					first = false;
					// Emit the value!
					observer.next((previous = current));
				},
			});
		});
}
