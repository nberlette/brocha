// deno-lint-ignore-file no-explicit-any ban-types
import { BrotliErrorCode, BrotliResultCode } from "./internal/constants.ts";
import { Error, TypeError } from "./internal/primordials.ts";

// #region BrotliDecoderError

/**
 * Used to resolve a human-readable error name from a numeric error code.
 *
 * @category Errors
 * @tags Utility
 */
export type BrotliErrorName<K extends BrotliErrorCode = BrotliErrorCode> =
  & string
  & keyof {
    [
      P in keyof typeof BrotliErrorCode as P extends string
        ? typeof BrotliErrorCode[P] extends K ? P : never
        : never
    ]: P;
  }
  & {};

/**
 * Represents the options for a Brotli decoder error.
 *
 * @category Errors
 * @tags Options
 */
export interface BrotliErrorOptions<
  K extends BrotliErrorCode = BrotliErrorCode,
> extends ErrorOptions {
  code?: K | undefined;
  kind?: BrotliErrorName<K> | undefined;
  name?: string | undefined;
  message?: string | undefined;
  cause?: unknown;
}

/**
 * Represents a Brotli decoder error's JSON representation.
 *
 * @category Errors
 * @tags JSON
 */
export interface BrotliErrorJson<K extends BrotliErrorCode = BrotliErrorCode> {
  code: K;
  kind: BrotliErrorName<K>;
  name: string;
  message: string;
  cause?: unknown;
  stack?: string | undefined;
}

/**
 * Represents a Brotli decoder error.
 *
 * @category Errors
 * @abstract
 */
export abstract class BrotliDecoderError<
  K extends BrotliErrorCode = BrotliErrorCode.UNKNOWN,
> extends Error {
  static readonly prefix = "BROTLI_DECODER_ERROR";

  abstract readonly code: K;
  abstract readonly kind: BrotliErrorName<K>;
  override readonly message!: string;
  readonly options: BrotliErrorOptions<K> = {};

  constructor(
    message?: string | null,
    options?: BrotliErrorOptions<K> | null,
  ) {
    if (new.target === BrotliDecoderError) {
      throw new TypeError(
        "Abstract class BrotliDecoderError cannot be instantiated directly.",
      );
    }
    const { cause, message: msg } = options ??= {};
    super(message ?? msg ?? cause + "", { cause });
    this.options = options;
    this.message = options.message ??= this.message ?? cause + "";
    // @ts-ignore abstract member assignment in constructor
    this.code = options.code ??= this.code ?? BrotliErrorCode.UNKNOWN;
    // @ts-ignore abstract member assignment in constructor
    this.kind = options.kind ??= this.kind ?? "UNKNOWN";
  }

  override get name(): `${typeof BrotliDecoderError.prefix}_${BrotliErrorName<
    K
  >}` {
    return `${BrotliDecoderError.prefix}_${this.kind}` as const;
  }

  override get cause(): string | Error | undefined {
    return (super.cause ?? this.options.cause) as string | Error;
  }

  toJSON(): BrotliErrorJson<K> {
    const { code, name, kind, message, cause, stack } = this;
    return { code, kind, name, message, cause, stack };
  }
}

/**
 * Represents an unknown error.
 * @category Errors
 */
export class BrotliDecoderUnknownError extends BrotliDecoderError<
  BrotliErrorCode.UNKNOWN
> {
  readonly code = BrotliErrorCode.UNKNOWN;
  readonly kind = "UNKNOWN";
  override readonly message = "Unknown error occurred.";
}

/**
 * Represents an unreachable code error.
 * @category Errors
 */
export class BrotliDecoderUnreachableError extends BrotliDecoderError<
  BrotliErrorCode.UNREACHABLE
> {
  readonly code = BrotliErrorCode.UNREACHABLE;
  readonly kind = "UNREACHABLE";
  override readonly message = "Unreachable code reached.";
}

/**
 * Represents an error when allocating block kind trees.
 * @category Errors
 */
export class BrotliDecoderAllocBlockTypeTreesError extends BrotliDecoderError<
  BrotliErrorCode.ALLOC_BLOCK_TYPE_TREES
> {
  readonly code = BrotliErrorCode.ALLOC_BLOCK_TYPE_TREES;
  readonly kind = "ALLOC_BLOCK_TYPE_TREES";
  override readonly message = "Failed to allocate block kind trees.";
}

/**
 * Represents an error when allocating ring buffer 2.
 * @category Errors
 */
export class BrotliDecoderAllocRingBuffer2Error extends BrotliDecoderError<
  BrotliErrorCode.ALLOC_RING_BUFFER_2
> {
  readonly code = BrotliErrorCode.ALLOC_RING_BUFFER_2;
  readonly kind = "ALLOC_RING_BUFFER_2";
  override readonly message = "Failed to allocate ring buffer 2.";
}

/**
 * Represents an error when allocating ring buffer 1.
 * @category Errors
 */
export class BrotliDecoderAllocRingBuffer1Error extends BrotliDecoderError<
  BrotliErrorCode.ALLOC_RING_BUFFER_1
> {
  readonly code = BrotliErrorCode.ALLOC_RING_BUFFER_1;
  readonly kind = "ALLOC_RING_BUFFER_1";
  override readonly message = "Failed to allocate ring buffer 1.";
}

/**
 * Represents an error when allocating context map.
 * @category Errors
 */
export class BrotliDecoderAllocContextMapError extends BrotliDecoderError<
  BrotliErrorCode.ALLOC_CONTEXT_MAP
> {
  readonly code = BrotliErrorCode.ALLOC_CONTEXT_MAP;
  readonly kind = "ALLOC_CONTEXT_MAP";
  override readonly message = "Failed to allocate context map.";
}

/**
 * Represents an error when allocating tree groups.
 * @category Errors
 */
export class BrotliDecoderAllocTreeGroupsError extends BrotliDecoderError<
  BrotliErrorCode.ALLOC_TREE_GROUPS
> {
  readonly code = BrotliErrorCode.ALLOC_TREE_GROUPS;
  readonly kind = "ALLOC_TREE_GROUPS";
  override readonly message = "Failed to allocate tree groups.";
}

/**
 * Represents an error when allocating context modes.
 * @category Errors
 */
export class BrotliDecoderAllocContextModesError extends BrotliDecoderError<
  BrotliErrorCode.ALLOC_CONTEXT_MODES
> {
  readonly code = BrotliErrorCode.ALLOC_CONTEXT_MODES;
  readonly kind = "ALLOC_CONTEXT_MODES";
  override readonly message = "Failed to allocate context modes.";
}

/**
 * Represents an error due to invalid arguments.
 * @category Errors
 */
export class BrotliDecoderInvalidArgumentsError extends BrotliDecoderError<
  BrotliErrorCode.INVALID_ARGUMENTS
> {
  readonly code = BrotliErrorCode.INVALID_ARGUMENTS;
  readonly kind = "INVALID_ARGUMENTS";
  override readonly message = "Invalid arguments.";
}

/**
 * Represents an error when the dictionary is not set.
 * @category Errors
 */
export class BrotliDecoderDictionaryNotSetError extends BrotliDecoderError<
  BrotliErrorCode.DICTIONARY_NOT_SET
> {
  readonly code = BrotliErrorCode.DICTIONARY_NOT_SET;
  readonly kind = "DICTIONARY_NOT_SET";
  override readonly message = "Dictionary not set.";
}

/**
 * Represents an error due to invalid distance.
 * @category Errors
 */
export class BrotliDecoderDistanceError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_DISTANCE
> {
  readonly code = BrotliErrorCode.FORMAT_DISTANCE;
  readonly kind = "FORMAT_DISTANCE";
  override readonly message = "Invalid distance found.";
}

/**
 * Represents an error due to invalid padding bits in the last metablock.
 * @category Errors
 */
export class BrotliDecoderPadding2Error extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_PADDING_2
> {
  readonly code = BrotliErrorCode.FORMAT_PADDING_2;
  readonly kind = "FORMAT_PADDING_2";
  override readonly message =
    "Invalid padding bits found in the last metablock.";
}

/**
 * Represents an error due to invalid padding bits.
 * @category Errors
 */
export class BrotliDecoderPadding1Error extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_PADDING_1
> {
  readonly code = BrotliErrorCode.FORMAT_PADDING_1;
  readonly kind = "FORMAT_PADDING_1";
  override readonly message = "Invalid padding bits found.";
}

/**
 * Represents an error due to invalid window size.
 * @category Errors
 */
export class BrotliDecoderWindowBitsError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_WINDOW_BITS
> {
  readonly code = BrotliErrorCode.FORMAT_WINDOW_BITS;
  readonly kind = "FORMAT_WINDOW_BITS";
  override readonly message = "Invalid window size found.";
}

/**
 * Represents an error due to invalid dictionary size or distance.
 * @category Errors
 */
export class BrotliDecoderDictionaryError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_DICTIONARY
> {
  readonly code = BrotliErrorCode.FORMAT_DICTIONARY;
  readonly kind = "FORMAT_DICTIONARY";
  override readonly message = "Invalid dictionary size or distance found.";
}

/**
 * Represents an error due to a reserved transform.
 * @category Errors
 */
export class BrotliDecoderTransformError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_TRANSFORM
> {
  readonly code = BrotliErrorCode.FORMAT_TRANSFORM;
  readonly kind = "FORMAT_TRANSFORM";
  override readonly message = "Reserved transform found.";
}

/**
 * Represents an error due to block length being too long.
 * @category Errors
 */
export class BrotliDecoderBlockLength2Error extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_BLOCK_LENGTH_2
> {
  readonly code = BrotliErrorCode.FORMAT_BLOCK_LENGTH_2;
  readonly kind = "FORMAT_BLOCK_LENGTH_2";
  override readonly message = "Block length is too long.";
}

/**
 * Represents an error due to block length being too short.
 * @category Errors
 */
export class BrotliDecoderBlockLength1Error extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_BLOCK_LENGTH_1
> {
  readonly code = BrotliErrorCode.FORMAT_BLOCK_LENGTH_1;
  readonly kind = "FORMAT_BLOCK_LENGTH_1";
  override readonly message = "Block length is too short.";
}

/**
 * Represents an error due to context map repeat being too long.
 * @category Errors
 */
export class BrotliDecoderContextMapRepeatError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_CONTEXT_MAP_REPEAT
> {
  readonly code = BrotliErrorCode.FORMAT_CONTEXT_MAP_REPEAT;
  readonly kind = "FORMAT_CONTEXT_MAP_REPEAT";
  override readonly message = "Context map repeat is too long.";
}

/**
 * Represents an error due to distance code being too far back for the huffman code.
 * @category Errors
 */
export class BrotliDecoderHuffmanSpaceError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_HUFFMAN_SPACE
> {
  readonly code = BrotliErrorCode.FORMAT_HUFFMAN_SPACE;
  readonly kind = "FORMAT_HUFFMAN_SPACE";
  override readonly message =
    "Distance code is too far back for the huffman code.";
}

/**
 * Represents an error due to distance code being too far back.
 * @category Errors
 */
export class BrotliDecoderClSpaceError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_CL_SPACE
> {
  readonly code = BrotliErrorCode.FORMAT_CL_SPACE;
  readonly kind = "FORMAT_CL_SPACE";
  override readonly message = "Distance code is too far back.";
}

/**
 * Represents an error due to duplicate simple Huffman symbols.
 * @category Errors
 */
export class BrotliDecoderSimpleHuffmanSameError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_SIMPLE_HUFFMAN_SAME
> {
  readonly code = BrotliErrorCode.FORMAT_SIMPLE_HUFFMAN_SAME;
  readonly kind = "FORMAT_SIMPLE_HUFFMAN_SAME";
  override readonly message = "Duplicate simple Huffman symbols.";
}

/**
 * Represents an error due to simple Huffman code alphabet error.
 * @category Errors
 */
export class BrotliDecoderSimpleHuffmanAlphabetError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_SIMPLE_HUFFMAN_ALPHABET
> {
  readonly code = BrotliErrorCode.FORMAT_SIMPLE_HUFFMAN_ALPHABET;
  readonly kind = "FORMAT_SIMPLE_HUFFMAN_ALPHABET";
  override readonly message = "Simple Huffman code alphabet error.";
}

/**
 * Represents an error due to invalid meta-block nibble.
 * @category Errors
 */
export class BrotliDecoderExuberantMetaNibbleError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_EXUBERANT_META_NIBBLE
> {
  readonly code = BrotliErrorCode.FORMAT_EXUBERANT_META_NIBBLE;
  readonly kind = "FORMAT_EXUBERANT_META_NIBBLE";
  override readonly message = "Invalid meta-block nibble.";
}

/**
 * Represents an error due to reserved format.
 * @category Errors
 */
export class BrotliDecoderReservedError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_RESERVED
> {
  readonly code = BrotliErrorCode.FORMAT_RESERVED;
  readonly kind = "FORMAT_RESERVED";
  override readonly message = "Reserved format error.";
}

/**
 * Represents an error due to invalid nibble.
 * @category Errors
 */
export class BrotliDecoderExuberantNibbleError extends BrotliDecoderError<
  BrotliErrorCode.FORMAT_EXUBERANT_NIBBLE
> {
  readonly code = BrotliErrorCode.FORMAT_EXUBERANT_NIBBLE;
  readonly kind = "FORMAT_EXUBERANT_NIBBLE";
  override readonly message = "Invalid nibble.";
}

/**
 * Represents a no error state.
 * @category Errors
 */
export class BrotliDecoderNoError extends BrotliDecoderError<
  BrotliErrorCode.NO_ERROR
> {
  readonly code = BrotliErrorCode.NO_ERROR;
  readonly kind = "NO_ERROR";
  override readonly message = "No error occurred.";
}
// #endregion BrotliDecoderError

// #region BrotliDecoderResult

/**
 * Represents the result of a Brotli decoder operation.
 *
 * - `ERROR`: The decompression operation failed.
 * - `SUCCESS`: The decompression operation was successful.
 * - `NEEDS_MORE_INPUT`: The decoder needs more input data to continue.
 * - `NEEDS_MORE_OUTPUT`: The decoder needs more output space to continue.
 *
 * @category Results
 * @abstract
 */
export abstract class BrotliDecoderResult<
  K extends BrotliResultCode = BrotliResultCode,
> extends Error {
  abstract readonly code: K;
  abstract readonly kind: string;
  override readonly message: string = "";

  constructor(message?: string | null) {
    if (new.target === BrotliDecoderResult) {
      throw new TypeError(
        "Abstract class BrotliDecoderResult cannot be instantiated directly.",
      );
    }
    super(message || "");
    this.message = message || this.message || "";
  }

  toJSON(): {
    readonly type: "BrotliDecoderResult";
    code: K;
    kind: string;
    message: string;
  } {
    const { code, kind, message } = this;
    const type = "BrotliDecoderResult";
    return { type, code, kind, message };
  }
}

/**
 * Represents the result of a failed Brotli decoder operation.
 *
 * @category Results
 * @tags Error
 */
export class BrotliDecoderErrorResult<
  T extends BrotliDecoderError<BrotliErrorCode> = BrotliDecoderError<any>,
> extends BrotliDecoderResult<BrotliResultCode.ERROR> {
  readonly code = BrotliResultCode.ERROR;
  readonly kind = "BROTLI_DECODER_RESULT_ERROR";

  constructor(readonly error: T) {
    super(`Decompression failed: ${error.message}`);
  }
}

/**
 * Represents the result of a successful Brotli decoder operation.
 *
 * @category Results
 * @tags Success
 */
export class BrotliDecoderSuccessResult
  extends BrotliDecoderResult<BrotliResultCode.SUCCESS> {
  readonly code = BrotliResultCode.SUCCESS;
  readonly kind = "BROTLI_DECODER_RESULT_SUCCESS";
  override readonly message = "Decompression successful.";
}

/**
 * Represents the result of a Brotli decoder operation that needs more input data.
 *
 * @category Results
 * @tags NeedsMoreInput, streaming
 */
export class BrotliDecoderNeedsMoreInputResult
  extends BrotliDecoderResult<BrotliResultCode.NEEDS_MORE_INPUT> {
  readonly code = BrotliResultCode.NEEDS_MORE_INPUT;
  readonly kind = "BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT";
  override readonly message = "Decoder needs more input data to continue.";
}

/**
 * Represents the result of a Brotli decoder operation that needs more output space.
 *
 * @category Results
 * @tags NeedsMoreOutput, streaming
 */
export class BrotliDecoderNeedsMoreOutputResult
  extends BrotliDecoderResult<BrotliResultCode.NEEDS_MORE_OUTPUT> {
  readonly code = BrotliResultCode.NEEDS_MORE_OUTPUT;
  readonly kind = "BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT";
  override readonly message = "Decoder needs more output space to continue.";
}

// #endregion BrotliDecoderResult
