// import { any } from 'abort-signal-interop';
// import { BehaviorSubject } from '../subject/behavior-subject';
// import { BroadcastSubject } from '../subject/broadcast-subject';
import { ObservableInput, from, ObservedValueOf } from './from';
// import { map } from '../operators/map';
// import { fromEvent, take } from './from-event';
import { Observable } from './observable';
// import { of } from './of';
// import { Pipeline } from '../pipeline';
// import { switchMap } from '../operators/switch-map';
// import { tap } from '../operators/tap';
// import { Subscriber } from 'subscriber';
// import { takeUntil } from '../operators/take-until';

export function defer<Input extends ObservableInput>(
	factory: () => Input,
): Observable<ObservedValueOf<Input>> {
	return new Observable((subscriber) => from(factory()).subscribe(subscriber));
}

// export const cart = new Observable(async (subscriber) => {
// 	const response = await globalThis.fetch('/cart.json', {
// 		body: '',
// 		method: 'POST',
// 		signal: subscriber.signal,
// 	});
// 	return await response.json();
// }).pipe();

// interface Cart {
// 	id: string;
// 	name: string;
// 	price: number;
// 	quantity: number;
// }

// interface DeleteLineItemGroupErrors {
// 	readonly unknown: boolean;
// }

// interface CreateOrUpdateCouponCodeErrors {
// 	readonly unknown: boolean;
// }
// export class CartService {
// 	readonly #controller = new AbortController();

// 	readonly #id = new BehaviorSubject<string | null>(null);
// 	readonly id = this.#id.asObservable();

// 	readonly #jwt = new BehaviorSubject<string | null>(null);
// 	readonly jwt = this.#jwt.asObservable();

// 	readonly #local = new BehaviorSubject<Cart | null>(null);
// 	readonly #channel = new BroadcastSubject<Cart | null>('cart');
// 	readonly #cart = this.id.pipe(switchMap((id) => this.#getCart(id!)));
// 	readonly cart = this.#local.pipe(
// 		switchMap((local) => (local ? of(local) : this.#cart)),
// 	);

// 	constructor() {
// 		this.#channel.subscribe((cart) => this.#local.next(cart));
// 	}

// 	createOrUpdateCouponCode(
// 		code: string,
// 	): Observable<CreateOrUpdateCouponCodeErrors | null> {
// 		return new Observable<Response>(async (subscriber) => {
// 			new Subscriber({
// 				signal: this.#controller.signal,
// 				finalize: () => subscriber.complete(),
// 			});
// 			const response = await globalThis.fetch('/cart.json', {
// 				body: JSON.stringify({
// 					query: '',
// 					variables: { cartId: this.#id.value, code },
// 				}),
// 				method: 'POST',
// 				signal: subscriber.signal,
// 			});
// 			subscriber.next(response);
// 		}).pipe(
// 			take(1),
// 			switchMap((response) => response.json()),
// 			tap(({ cart }) => this.#local.next(cart)),
// 			tap(({ cart }) => this.#channel.next(cart)),
// 			map(({ errors }) => errors),
// 		);
// 	}

// 	deleteLineItemGroup(
// 		id: string,
// 	): Observable<DeleteLineItemGroupErrors | null> {
// 		return new Observable<Response>(async (subscriber) => {
// 			new Subscriber({
// 				signal: this.#controller.signal,
// 				finalize: () => subscriber.complete(),
// 			});
// 			const response = await globalThis.fetch('/cart.json', {
// 				body: JSON.stringify({
// 					query: '',
// 					variables: { lineItemGroupId: id, cartId: this.#id.value },
// 				}),
// 				method: 'POST',
// 				signal: subscriber.signal,
// 			});
// 			subscriber.next(response);
// 		}).pipe(
// 			take(1),
// 			switchMap((response) => response.json()),
// 			tap(({ cart }) => this.#local.next(cart)),
// 			tap(({ cart }) => this.#channel.next(cart)),
// 			map(({ errors }) => errors),
// 		);
// 	}

// 	destroy(): void {
// 		this.#controller.abort();
// 		this.#id.complete();
// 		this.#jwt.complete();
// 		this.#local.complete();
// 		this.#channel.complete();
// 	}

// 	#getCart(id: string): Observable<Cart> {
// 		return fromFetch('/cart.json', {
// 			body: JSON.stringify({ query: '', variables: { id } }),
// 			method: 'POST',
// 		}).pipe(
// 			switchMap(async (response) => response.json() as Promise<Cart>),
// 			tap((cart) => this.#channel.next(cart)),
// 			takeUntil(fromEvent(this.#controller.signal, 'abort')),
// 		);
// 		// return new Observable<Response>(async (subscriber) => {
// 		// 	new Subscriber({
// 		// 		signal: this.#controller.signal,
// 		// 		finalize: () => subscriber.complete(),
// 		// 	});
// 		// 	try {
// 		// 		const response = await globalThis.fetch('/cart.json', {
// 		// 			body: JSON.stringify({ query: '', variables: { id } }),
// 		// 			method: 'POST',
// 		// 			signal: subscriber.signal,
// 		// 		});
// 		// 		subscriber.next(response);
// 		// 	} catch (error) {
// 		// 		subscriber.error(error);
// 		// 	}
// 		// }).pipe(
// 		// 	take(1),
// 		// 	switchMap(async (response) => response.json() as Cart),
// 		// 	tap((cart) => this.#channel.next(cart)),
// 		// );
// 	}
// }

export function fromFetch(
	input: RequestInfo | URL,
	init?: Omit<RequestInit, 'signal'>,
): Observable<Response> {
	return new Observable<Response>(async (subscriber) => {
		try {
			const response = await globalThis.fetch(input, {
				...init,
				signal: subscriber.signal,
			});
			subscriber.next(response);
			subscriber.complete();
		} catch (error) {
			subscriber.error(error);
		}
	});
}
