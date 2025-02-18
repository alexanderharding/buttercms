import { ObservableInput, from, ObservedValueOf } from './from';
import { Observable } from './observable';

export function defer<Input extends ObservableInput>(
	factory: () => Input,
): Observable<ObservedValueOf<Input>> {
	return new Observable((subscriber) => from(factory()).subscribe(subscriber));
}
