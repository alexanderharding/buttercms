import { Observable, ConsumerObserver } from '../observable';
import { Subject } from '../subject';
import { from, type ObservableInput, type ObservedValueOf } from './creation';
import { Subscribable } from './subscribable';

export function connectable<Input extends ObservableInput>(
	input: Input,
	connector: (
		source: Observable<ObservedValueOf<Input>>,
	) => Subscribable<ObservedValueOf<Input>> &
		Partial<ConsumerObserver<ObservedValueOf<Input>>> = () => new Subject(),
): Observable<ObservedValueOf<Input>> {
	return new Observable((observer) => {
		if (observer.signal.aborted) return;
		const source = from(input);
		const subject = connector(source);
		subject.subscribe(observer);
		if (observer.signal.aborted) return;
		source.subscribe(subject);
	});
}
