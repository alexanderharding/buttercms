/**
 * An error that is not handled by the implementation of the library.
 */
export type UnhandledError = Error;

/**
 * Object interface for a {@linkcode UnhandledError} factory.
 */
export type UnhandledErrorConstructor = new (
	options: ErrorOptions,
) => UnhandledError;

export const UnhandledError: UnhandledErrorConstructor = class extends Error {
	constructor(options: ErrorOptions) {
		super('unhandledError', options);
	}
};
