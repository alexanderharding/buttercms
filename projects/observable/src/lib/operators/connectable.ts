import {
	ObservableInput,
	ObservedValueOf,
	Observable,
	Observer,
	from,
} from '../observable';
import { Subject } from '../subject';
import { Subscribable } from './subscribable';

export function connectable<Input extends ObservableInput>(
	input: Input,
	connector: (
		source: Observable<ObservedValueOf<Input>>,
	) => Subscribable<ObservedValueOf<Input>> &
		Partial<Observer<ObservedValueOf<Input>>> = () => new Subject(),
): Observable<ObservedValueOf<Input>> {
	return new Observable((subscriber) => {
		if (subscriber.signal.aborted) return;
		const source = from(input);
		const subject = connector(source);
		subject.subscribe(subscriber);
		source.subscribe(subject);
	});
}
