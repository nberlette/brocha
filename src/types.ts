/**
 * Options for the {@linkcode decompress} function, to customize the behavior
 * of the Brotli decompression process. Currently the only supported option is
 * a custom dictionary for the decompressor to use.
 *
 * @category Types
 */
export interface BrotliDecodeOptions {
  /**
   * Custom dictionary to use for the Brotli decompression process. This should
   * be a BufferSource object containing text-based dictionary data, or `null`
   * to use the default dictionary.
   *
   * @remarks
   * The dictionary must be a valid Brotli dictionary, and must be the same
   * dictionary that was used to compress the data. If the dictionary is not
   * valid, or if it does not match the dictionary used to compress the data,
   * the decompression process will almost certainly fail.
   */
  customDictionary: BufferSource | null;
}
