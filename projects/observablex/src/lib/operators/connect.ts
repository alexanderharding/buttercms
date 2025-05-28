import { UnaryFunction } from '../pipe';
import { Observable, Observer } from '../observable';
import { Subscribable } from './subscribable';
import { connectable } from './connectable';
import { ObservableInput, ObservedValueOf } from './creation';

export function connect<Input extends ObservableInput>(
	connector?: (
		source: Observable<ObservedValueOf<Input>>,
	) => Subscribable<ObservedValueOf<Input>> &
		Partial<Observer<ObservedValueOf<Input>>>,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) => connectable(source, connector);
}
