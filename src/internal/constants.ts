/**
 * The maximum number of bytes to read from the input stream at a time.
 * @category Constants
 */
export const CHUNK_SIZE = 16384;

export const BROTLI_DECODE = 8;
export const BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION = 0;
export const BROTLI_DECODER_PARAM_LARGE_WINDOW = 1;

/**
 * Represents the error codes that can be returned by the Brotli decoder.
 *
 * @category Constants
 */
export const enum BrotliErrorCode {
  UNREACHABLE = -31,
  ALLOC_BLOCK_TYPE_TREES = -30,
  // reserved: -29
  // reserved: -28
  ALLOC_RING_BUFFER_2 = -27,
  ALLOC_RING_BUFFER_1 = -26,
  ALLOC_CONTEXT_MAP = -25,
  ALLOC_TREE_GROUPS = -22,
  ALLOC_CONTEXT_MODES = -21,
  INVALID_ARGUMENTS = -20,
  DICTIONARY_NOT_SET = -19,
  // reserved: -18
  // reserved: -17
  FORMAT_DISTANCE = -16,
  FORMAT_PADDING_2 = -15,
  FORMAT_PADDING_1 = -14,
  FORMAT_WINDOW_BITS = -13,
  FORMAT_DICTIONARY = -12,
  FORMAT_TRANSFORM = -11,
  FORMAT_BLOCK_LENGTH_2 = -10,
  FORMAT_BLOCK_LENGTH_1 = -9,
  FORMAT_CONTEXT_MAP_REPEAT = -8,
  FORMAT_HUFFMAN_SPACE = -7,
  FORMAT_CL_SPACE = -6,
  FORMAT_SIMPLE_HUFFMAN_SAME = -5,
  FORMAT_SIMPLE_HUFFMAN_ALPHABET = -4,
  FORMAT_EXUBERANT_META_NIBBLE = -3,
  FORMAT_RESERVED = -2,
  FORMAT_EXUBERANT_NIBBLE = -1,
  // unknown errors (or no error, but decompression failed)
  NO_ERROR = 0,
  UNKNOWN = NO_ERROR,
}

/**
 * Represents the result codes that can be returned by the Brotli decoder.
 *
 * - `ERROR`: The decompression operation failed.
 * - `SUCCESS`: The decompression operation was successful.
 * - `NEEDS_MORE_INPUT`: The decoder needs more input data to continue.
 * - `NEEDS_MORE_OUTPUT`: The decoder needs more output space to continue.
 *
 * @category Constants
 */
export const enum BrotliResultCode {
  /** The decompression operation failed. */
  ERROR = 0,
  /** The decompression operation was successful. */
  SUCCESS = 1,
  /** The decoder needs more input data to continue. */
  NEEDS_MORE_INPUT = 2,
  /** The decoder needs more output space to continue. */
  NEEDS_MORE_OUTPUT = 3,
}
