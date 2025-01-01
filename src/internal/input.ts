import { Int8Array } from "./primordials.ts";
import { toInt8Array } from "./encoding.ts";

/**
 * Represents a stream of input data, either as a string or binary data buffer.
 *
 * All input types are converted to an `Int8Array` byte buffer prior to being
 * processed by the decompression algorithm.
 */
export class InputStream {
  data: Int8Array = new Int8Array(0);

  constructor(data: string | BufferSource, public offset = 0) {
    if (data) this.data = toInt8Array(data);
  }
}
