import { HttpEvent, HttpRequest } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

export type ResponseTimeoutError = TimeoutError<
	HttpEvent<unknown>,
	HttpRequest<unknown>
>;
