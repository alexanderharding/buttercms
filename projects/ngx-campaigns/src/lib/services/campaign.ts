import { inject, Injectable } from '@angular/core';
import { InteropObservable, Subscribable } from 'rxjs';
import { storageKey } from '../injection-tokens/storage-key';

/**
 * @description An {@linkcode InteropObservable} (see examples) {@linkcode Map|map} of key/value pairs.
 * @usage A/B campaign tracking.
 * @example
 * import { inject } from '@angular/core';
 * import { pickOne, CampaignService } from "ngx-campaigns";
 *
 * const campaignService = inject(CampaignService);
 * const key = "test";
 *
 * // Role the dice if the key does not exist.
 * if(!campaignService.has(key)) campaignService.set(key, pickOne(["default", "A"]));
 * const value = campaignService.get(key)!;
 * @example
 * import { inject } from '@angular/core';
 * import { Observable, from, InteropObservable } from "rxjs";
 * import { CampaignService } from "ngx-campaigns";
 *
 * const campaignService = inject(CampaignService);
 * const campaignService$ = from<InteropObservable<CampaignService>>(campaignService);
 * @example
 * import { Observable, from, InteropObservable } from "rxjs";
 * import { CampaignService } from "ngx-campaigns";
 *
 * const campaignService = inject(CampaignService);
 * const changeDetected$ = from<InteropObservable<CampaignService>>(campaignService).pipe(skip(1));
 * @example
 * import { inject } from '@angular/core';
 * import { distinctUntilChanged, Observable, from, InteropObservable } from "rxjs";
 * import { CampaignService } from "ngx-campaigns";
 *
 * const campaignService = inject(CampaignService);
 * const key = "test";
 * const value$ = from<InteropObservable<CampaignService>>(campaignService).pipe(
 * 		map((service) => service.get(key)),
 * 		distinctUntilChanged(),
 * );
 */
@Injectable({ providedIn: 'root' })
export class CampaignService
	implements Map<string, string>, InteropObservable<CampaignService>
{
	readonly [Symbol.toStringTag] = CampaignService.name;
	readonly #storageKey = inject(storageKey);
	readonly #eventTarget = new EventTarget();

	get size(): number {
		return new Map(this.#stored).size;
	}

	get #stored(): ReadonlyArray<[key: string, value: string]> {
		try {
			// Local storage is not available in some environments or when quotas are exceeded.
			return JSON.parse(
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				globalThis.localStorage.getItem(this.#storageKey) || '[]',
			) as ReadonlyArray<[key: string, value: string]>;
		} catch {
			return [];
		}
	}

	set #stored(iterable: Iterable<[key: string, value: string]>) {
		try {
			// Local storage is not available in some environments or when quotas are exceeded.
			globalThis.localStorage.setItem(
				this.#storageKey,
				JSON.stringify(Array.from(iterable)),
			);
			// Synthetic events, like the one below, are handled synchronously unlike their DOM-based counterparts.
			this.#eventTarget.dispatchEvent(new Event('changeDetected'));
		} catch {
			// Fail silently.
		}
	}

	/**
	 * @deprecated This requires polly-filling, which we are not doing, and it will not be supported in upcoming versions of RxJS. Use `"@@observable"` instead.
	 * @aliases `"@@observable"`
	 */
	// This only exists to satisfy the InteropObservable interface even though internally RxJS allows using "@@observable" as per their docs recommendation.
	// We have unit tests to ensure this is working as expected.
	[Symbol.observable](): Subscribable<this> {
		return this['@@observable']();
	}

	/**
	 * @usage Observable interop. See example.
	 * @returns A {@linkcode Subscribable} that emits the {@linkcode CampaignService|service} instance on subscription and when key/value changes are detected.
	 * @alias `Symbol.observable`
	 * @example
	 * import { skip, Observable, from, InteropObservable } from "rxjs";
	 *
	 * const campaignService = inject(CampaignService);
	 * const campaignService$ = from<InteropObservable<CampaignService>>(campaignService);
	 * const changeDetected$ = campaignService$.pipe(skip(1));
	 */
	['@@observable'](): Subscribable<this> {
		return {
			subscribe: (observer) => {
				const controller = new AbortController();
				const options = { signal: controller.signal } as const;

				this.#eventTarget.addEventListener(
					'changeDetected',
					() => observer.next?.(this),
					options,
				);

				globalThis.addEventListener(
					'storage',
					({ storageArea, key }) => {
						if (
							storageArea === globalThis.localStorage &&
							key === this.#storageKey
						) {
							// In this case, observer.next?.(this) is more efficient than dispatching a 'changeDetected' event.
							observer.next?.(this);
						}
					},
					options,
				);

				// Emit initial value after event listeners are set up.
				observer.next?.(this);

				return { unsubscribe: () => controller.abort('unsubscribe') };
			},
		};
	}

	[Symbol.iterator](): IterableIterator<[key: string, value: string]> {
		return new Map(this.#stored)[Symbol.iterator]();
	}

	entries(): IterableIterator<[key: string, value: string]> {
		return new Map(this.#stored).entries();
	}

	values(): IterableIterator<string> {
		return new Map(this.#stored).values();
	}

	keys(): IterableIterator<string> {
		return new Map(this.#stored).keys();
	}

	has(key: string): boolean {
		return new Map(this.#stored).has(key);
	}

	get(key: string): string | undefined {
		return new Map(this.#stored).get(key);
	}

	forEach(
		callbackfn: (value: string, key: string, service: this) => void,
		thisArg?: unknown,
	): void {
		return new Map(this.#stored).forEach(
			(value, key) => callbackfn(value, key, this),
			thisArg,
		);
	}

	set(key: string, value: string): this {
		const map = new Map(this.#stored);
		const settable = !map.has(key) || map.get(key) !== value;
		if (settable) this.#stored = map.set(key, value);
		return this;
	}

	delete(key: string): boolean {
		const map = new Map(this.#stored);
		const deleted = map.delete(key);
		if (deleted) this.#stored = map;
		return deleted;
	}

	clear(): void {
		if (this.size) this.#stored = new Map();
	}
}
