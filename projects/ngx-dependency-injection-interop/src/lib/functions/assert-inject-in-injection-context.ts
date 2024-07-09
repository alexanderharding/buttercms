import {
	HostAttributeToken,
	ProviderToken,
	assertInInjectionContext,
	inject,
} from '@angular/core';
import { InjectOptions } from '../types';

/**
 * @param debugFn a reference to the function making the assertion (used for the error message).
 */
export function assertInjectInInjectionContext(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: HostAttributeToken,
): string;
export function assertInjectInInjectionContext(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: HostAttributeToken,
	options: Pick<InjectOptions<false>, 'optional'>,
): string;
export function assertInjectInInjectionContext(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: HostAttributeToken,
	options: Pick<InjectOptions, 'optional'>,
): string | null;
export function assertInjectInInjectionContext<Value>(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: ProviderToken<Value>,
): Value;
export function assertInjectInInjectionContext<Value>(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: ProviderToken<Value>,
	options: InjectOptions<false>,
): Value | null;
export function assertInjectInInjectionContext<Value>(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: ProviderToken<Value>,
	options: InjectOptions,
): Value;
export function assertInjectInInjectionContext(
	debugFn: (...params: ReadonlyArray<unknown>) => unknown,
	token: ProviderToken<unknown> | HostAttributeToken,
	options?: InjectOptions,
): unknown {
	assertInInjectionContext(debugFn);
	// We are safe to cast here because inject() has complex overloads and we are confident at this point that we've passed the correct arguments.
	return inject(token as HostAttributeToken, options as { optional: false });
}
