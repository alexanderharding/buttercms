import { Observable, ObservableInput } from 'rxjs';

/**
 * @public
 */
export type ResponseErrorHandlerFn = <T>(
  err: unknown,
  caught: Observable<T>
) => ObservableInput<T>;
