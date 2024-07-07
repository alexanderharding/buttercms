import { HttpEvent, HttpRequest } from '@angular/common/http';
import { ObservableInput, TimeoutConfig } from 'rxjs';

export type ResponseTimeoutConfig = Omit<
	TimeoutConfig<
		HttpEvent<unknown>,
		ObservableInput<HttpEvent<unknown>>,
		HttpRequest<unknown>
	>,
	'meta'
>;
