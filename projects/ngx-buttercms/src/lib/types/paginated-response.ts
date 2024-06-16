import { Response } from './response';
import { PaginationMeta } from './pagination-meta';

/**
 * @see {@link PaginationMeta}
 * @see {@link Response}
 */
export type PaginatedResponse<Data = unknown> = Response<Data> &
	Readonly<{ meta: PaginationMeta }>;
