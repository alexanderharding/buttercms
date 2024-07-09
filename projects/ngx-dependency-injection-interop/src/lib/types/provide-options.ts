/**
 * @description Options for the provided {@linkcode ProviderToken|token}.
 */
export type ProvideOptions<Multi extends boolean = boolean> = Readonly<
	Partial<{
		/**
		 * @description When `true`, `Injector` returns an array of instances. This is useful to allow multiple providers spread across many files to provide configuration information to a common {@linkcode ProviderToken|token}.
		 * @default false
		 * @see {@linkcode ProvideOptions}
		 */
		multi: Multi;
	}>
>;
