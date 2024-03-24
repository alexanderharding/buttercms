import { HttpParameterCodec } from '@angular/common/http';

const { encodeURIComponent, decodeURIComponent } = globalThis;

/**
 * Encodes and decodes URL parameter keys and values using the
 * built-in {@link encodeURIComponent} and {@link decodeURIComponent} functions.
 */
export const HTTP_PARAMETER_CODEC = Object.seal<HttpParameterCodec>({
  encodeKey: (key) => encodeURIComponent(key),
  encodeValue: (value) => encodeURIComponent(value),
  decodeKey: (key) => decodeURIComponent(key),
  decodeValue: (value) => decodeURIComponent(value),
});
