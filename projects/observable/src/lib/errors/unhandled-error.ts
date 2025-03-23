/**
 * An error that is not handled by the implementation of the library.
 * @public
 */
export type UnhandledError = Error;

/** @public */
export type UnhandledErrorConstructor = new (
	options: ErrorOptions,
) => UnhandledError;

export const UnhandledError: UnhandledErrorConstructor = class extends Error {
	constructor(options: ErrorOptions) {
		super('unhandledError', options);
	}
};
