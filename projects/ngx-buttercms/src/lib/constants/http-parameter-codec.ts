import { HttpParameterCodec } from '@angular/common/http';

const encode = globalThis.encodeURIComponent;
const decode = globalThis.decodeURIComponent;

/**
 * @description Encodes and decodes URL parameter keys and values using the standard {@link encodeURIComponent} and {@link decodeURIComponent} functions.
 */
export const httpParameterCodec: Readonly<HttpParameterCodec> = {
	encodeKey: encode,
	encodeValue: encode,
	decodeKey: decode,
	decodeValue: decode,
};
