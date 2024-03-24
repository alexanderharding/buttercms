import { Observable, ObservableInput } from "rxjs";

export type ResponseErrorHandlerFn = <T>(err: unknown, caught: Observable<T>) => ObservableInput<T>;
