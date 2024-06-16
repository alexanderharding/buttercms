import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ResponseCache = Readonly<{
	has(key: string): boolean;
	get(key: string): Observable<HttpEvent<unknown>> | undefined;
	set(key: string, value: Observable<HttpEvent<unknown>>): void;
}>;
