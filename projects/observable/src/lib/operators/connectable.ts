import { Observable, Observer } from '../observable';
import { Subject } from '../subject';
import { from, type ObservableInput, type ObservedValueOf } from './creation';
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
		if (subscriber.signal.aborted) return;
		source.subscribe(subject);
	});
}
