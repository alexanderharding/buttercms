import { UnaryFunction } from '../pipe';
import {
	Observer,
	Observable,
	ObservableInput,
	ObservedValueOf,
} from '../observable';
import { Subscribable } from './subscribable';
import { connectable } from './connectable';

export function connect<Input extends ObservableInput>(
	connector?: (
		source: Observable<ObservedValueOf<Input>>,
	) => Subscribable<ObservedValueOf<Input>> &
		Partial<Observer<ObservedValueOf<Input>>>,
): UnaryFunction<Input, Observable<ObservedValueOf<Input>>> {
	return (source) => connectable(source, connector);
}
