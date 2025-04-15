import { Observable } from '../../observable';
import { from, ObservableInput, ObservedValueOf } from '../creation';
import { UnaryFunction } from '../../pipe';
import { operate } from '../operate';
import { debounce } from 'rxjs';

export function asObservable<T extends ObservableInput>(): UnaryFunction<
	T,
	Observable<ObservedValueOf<T>>
> {
	return (source) => operate();
}
