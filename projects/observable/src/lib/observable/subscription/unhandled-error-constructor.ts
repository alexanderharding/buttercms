import type { UnhandledError } from './unhandled-error';

/**
 * Object interface for a {@linkcode UnhandledError} factory.
 */
export type UnhandledErrorConstructor = new (
	options: ErrorOptions,
) => UnhandledError;
