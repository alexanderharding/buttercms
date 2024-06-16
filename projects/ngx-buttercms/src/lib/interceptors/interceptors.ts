import { requestHydrationInterceptor } from './request-hydration-interceptor';
import { responseErrorHandlerInterceptor } from './response-error-handler-interceptor';
import { transferStateInterceptor } from './transfer-state-interceptor';
import { responseTimeoutInterceptor } from './response-timeout-interceptor';
import { responseCacheInterceptor } from './response-cache-interceptor';

/**
 * @see {@link responseErrorHandlerInterceptor}
 * @see {@link requestHydrationInterceptor}
 * @see {@link transferStateInterceptor}
 * @see {@link responseCacheInterceptor}
 * @see {@link responseTimeoutInterceptor}
 * @see {@link HttpInterceptorFn}
 */
// The order of these matters
export const interceptors = [
	responseErrorHandlerInterceptor,
	requestHydrationInterceptor,
	transferStateInterceptor,
	responseCacheInterceptor,
	responseTimeoutInterceptor,
] as const;
