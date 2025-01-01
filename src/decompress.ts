/**
 * This module provides a single {@linkcode decompress} function, which serves
 * as the primary high-level decompression API for the whole `brocha` library.
 *
 * @module decompress
 */
import { State } from "./state.ts";
import type { BrotliDecodeOptions } from "./types.ts";

/**
 * Decodes a `BufferSource` object containing Brotli-compressed data, returning
 * the decompressed output as a new `Uint8Array`.
 *
 * If decompression fails, a {@linkcode BrotliDecoderError} will be thrown with
 * the corresponding error message and associated error code (adapted directly
 * from the Brotli spec). The actual error thrown will be a specialized subtype
 * of the abstract `BrotliDecoderError` class, depending on what exactly caused
 * the decompression to fail (e.g. `BrotliDecoderInvalidArgumentError`).
 *
 * @param input The Brotli-compressed data to be decoded.
 * @param [options] Custom decompression options, allowing you to pass in a
 * custom dictionary to the decoder. See {@linkcode BrotliDecodeOptions} for
 * details on custom dictionary requirements and usage.
 * @returns The decompressed data, as a `Uint8Array` object.
 * @throws {BrotliDecoderError} With an error message and code related to the
 * problem that caused the error.
 * @example Decompressing a Brotli-compressed file:
 * ```ts
 * import { decompress } from "@nick/brocha"; // or npm:brocha
 * import * as fs from "node:fs";
 *
 * const compressed = fs.readFileSync("data.wasm.br");
 * const decompressed = decompress(compressed);
 *
 * const input = +(compressed.byteLength / 1024).toFixed(0);
 * const output = +(decompressed.byteLength / 1024).toFixed(0);
 * console.log(`${input}K => ${output} K (+${(input / output).toFixed(2)}x)`);
 * // Example log: "115K => 483K (+4.2x)"
 * ```
 * @example Instantiating a brotli-compressed WebAssembly module:
 * ```ts no-eval
 * import { decompress } from "brocha"; // or @nick/brocha
 * import { add, instantiate } from "./add.generated.js";
 *
 * await instantiate({ decompress });
 * console.log(add(1, 2)); // 3
 * ```
 */
export function decompress(
  input: BufferSource,
  options?: BrotliDecodeOptions,
): Uint8Array {
  return State.decompress(input, options?.customDictionary);
}

export default decompress;
