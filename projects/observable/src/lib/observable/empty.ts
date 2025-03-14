import { Observable } from './observable';

export const empty = new Observable<never>((subscriber) => {
	subscriber.complete();
});
