export type InjectOptions<
	Optional extends boolean = boolean,
	SkipSelf extends boolean = boolean,
	Self extends boolean = boolean,
	Host extends boolean = boolean,
> = Readonly<
	Partial<{
		/**
		 * @description Use optional injection, and return `null` if the requested token is not found.
		 */
		optional: Optional;
		/**
		 * @description Start injection at the parent of the current injector.
		 */
		skipSelf: SkipSelf;
		/**
		 * @description Only query the current injector for the token, and don't fall back to the parent injector if it's not found.
		 */
		self: Self;
		/**
		 * @description Stop injection at the host component's injector. Only relevant when injecting from an element injector, and a no-op for environment injectors.
		 */
		host: Host;
	}>
>;
