import { Observable } from '../../observable';
import { from, type ObservableInput, type ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';

export class EmptyError extends Error {
	constructor() {
		super('The Observable is empty');
	}
}

export function throwIfEmpty<Input extends ObservableInput>(
	factory: () => unknown = () => new EmptyError(),
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) =>
		new Observable((subscriber) => {
			let hasValue = false;
			from(source).subscribe({
				...subscriber,
				next(value) {
					hasValue = true;
					subscriber.next(value);
				},
				complete() {
					if (!hasValue) subscriber.error(factory());
				},
			});
		});
}
