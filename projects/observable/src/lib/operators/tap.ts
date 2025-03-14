import { Observer } from 'subscriber';
import { Observable } from '../observable/observable';
import { from, ObservableInput, ObservedValueOf } from '../observable/from';
import { UnaryFunction } from '../pipe/unary-function';

export function tap<In extends ObservableInput>(
	observerOrNext:
		| Partial<Observer<ObservedValueOf<In>>>
		| ((value: ObservedValueOf<In>) => void),
): UnaryFunction<In, Observable<ObservedValueOf<In>>> {
	return (source) =>
		new Observable((subscriber) => {
			from(source).subscribe(observerOrNext);
			from(source).subscribe(subscriber);
		});
}
