import { IdentityMeta } from './identity-meta';

export type Collection<
	Fields extends Readonly<Record<keyof unknown, unknown>> = Readonly<
		Record<keyof unknown, unknown>
	>,
> = Fields & Readonly<{ meta: IdentityMeta }>;
