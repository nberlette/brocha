import { BrotliDecoderTransformError } from "../errors.ts";
import { Int16Array, Int32Array, Int8Array } from "./primordials.ts";

/**
 * Represents the transforms used by the Brotli decoder to decompress data.
 *
 * @internal
 */
export class Transforms {
  readonly triplets: Int32Array = new Int32Array(0);
  readonly prefixSuffixStorage: Int8Array = new Int8Array(0);
  readonly prefixSuffixHeads: Int32Array = new Int32Array(0);
  readonly params: Int16Array = new Int16Array(0);

  constructor(
    readonly numTransforms: number,
    readonly prefixSuffixLen: number,
    readonly prefixSuffixCount: number,
  ) {
    this.numTransforms = numTransforms;
    this.triplets = new Int32Array(numTransforms * 3);
    this.params = new Int16Array(numTransforms);
    this.prefixSuffixStorage = new Int8Array(prefixSuffixLen);
    this.prefixSuffixHeads = new Int32Array(prefixSuffixCount + 1);
  }

  unpack(
    prefixSuffixSrc: string,
    transformsSrc: string,
  ): this {
    const expectedLen = this.prefixSuffixLen + this.prefixSuffixCount;
    const n = prefixSuffixSrc.length;
    if (n !== expectedLen) {
      throw new BrotliDecoderTransformError(
        `PrefixSuffix length mismatch: ${n} != ${expectedLen} expected`,
      );
    }

    let index = 1, j = 0;
    for (let i = 0; i < n; ++i) {
      const c = prefixSuffixSrc.charCodeAt(i);
      if (c === 35) {
        this.prefixSuffixHeads[index++] = j;
      } else {
        this.prefixSuffixStorage[j++] = c;
      }
    }

    if (transformsSrc.length !== this.triplets.length) {
      throw new BrotliDecoderTransformError(
        `transformsSrc length mismatch: ${transformsSrc.length} != ${this.triplets.length} expected`,
      );
    }

    for (let i = 0; i < this.triplets.length; ++i) {
      this.triplets[i] = transformsSrc.charCodeAt(i) - 32;
    }

    return this;
  }

  transformDictionaryWord(
    dst: Int8Array,
    dstOffset: number,
    src: Int8Array,
    srcOffset: number,
    wordLen: number,
    transformIndex: number,
  ): number {
    let offset = dstOffset;
    const transformOffset = 3 * transformIndex;
    const prefixIdx = this.triplets[transformOffset];
    const transform = this.triplets[transformOffset + 1];
    const suffixIdx = this.triplets[transformOffset + 2];
    const prefixEnd = this.prefixSuffixHeads[prefixIdx + 1];
    const suffixEnd = this.prefixSuffixHeads[suffixIdx + 1];

    let prefix = this.prefixSuffixHeads[prefixIdx];
    let suffix = this.prefixSuffixHeads[suffixIdx];

    let omitFirst = transform - 11, omitLast = transform;
    if (omitFirst < 1 || omitFirst > 9) omitFirst = 0;
    if (omitLast < 1 || omitLast > 9) omitLast = 0;

    while (prefix !== prefixEnd) {
      dst[offset++] = this.prefixSuffixStorage[prefix++];
    }

    let len = wordLen;
    if (omitFirst > len) omitFirst = len;
    let dictOffset = srcOffset + omitFirst;

    for (let i = len -= omitFirst + omitLast; i > 0; i--) {
      dst[offset++] = src[dictOffset++];
    }
    if (transform === 10 || transform === 11) {
      let upperOffset = offset - len;
      if (transform === 10) len = 1;
      while (len > 0) {
        const c0 = dst[upperOffset] & 0xFF;
        if (c0 < 0xC0) {
          if (c0 >= 97 && c0 <= 122) {
            dst[upperOffset] = dst[upperOffset] ^ 32;
          }
          upperOffset += 1;
          len -= 1;
        } else if (c0 < 0xE0) {
          dst[upperOffset + 1] = dst[upperOffset + 1] ^ 32;
          upperOffset += 2;
          len -= 2;
        } else {
          dst[upperOffset + 2] = dst[upperOffset + 2] ^ 5;
          upperOffset += 3;
          len -= 3;
        }
      }
    } else if (transform === 21 || transform === 22) {
      let shift = offset - len;
      const param = this.params[transformIndex];
      let scalar = (param & 0x7FFF) + (0x1000000 - (param & 0x8000));
      while (len > 0) {
        let step = 1;
        const c0 = dst[shift] & 0xFF;
        if (c0 < 0x80) {
          scalar += c0;
          dst[shift] = scalar & 0x7F;
        } else if (c0 < 0xC0) {
          /* ignore */
        } else if (c0 < 0xE0) {
          if (len >= 2) {
            const c1 = dst[shift + 1];
            scalar += (c1 & 0x3F) | ((c0 & 0x1F) << 6);
            dst[shift] = 0xC0 | ((scalar >> 6) & 0x1F);
            dst[shift + 1] = (c1 & 0xC0) | (scalar & 0x3F);
            step = 2;
          } else {
            step = len;
          }
        } else if (c0 < 0xF0) {
          if (len >= 3) {
            const c1 = dst[shift + 1];
            const c2 = dst[shift + 2];
            scalar += (c2 & 0x3F) | ((c1 & 0x3F) << 6) | ((c0 & 0x0F) << 12);
            dst[shift] = 0xE0 | ((scalar >> 12) & 0x0F);
            dst[shift + 1] = (c1 & 0xC0) | ((scalar >> 6) & 0x3F);
            dst[shift + 2] = (c2 & 0xC0) | (scalar & 0x3F);
            step = 3;
          } else {
            step = len;
          }
        } else if (c0 < 0xF8) {
          if (len >= 4) {
            const c1 = dst[shift + 1], c2 = dst[shift + 2], c3 = dst[shift + 3];
            scalar += (c3 & 0x3F) | ((c2 & 0x3F) << 6) | ((c1 & 0x3F) << 12) |
              ((c0 & 0x07) << 18);
            dst[shift] = 0xF0 | ((scalar >> 18) & 0x07);
            dst[shift + 1] = (c1 & 0xC0) | ((scalar >> 12) & 0x3F);
            dst[shift + 2] = (c2 & 0xC0) | ((scalar >> 6) & 0x3F);
            dst[shift + 3] = (c3 & 0xC0) | (scalar & 0x3F);
            step = 4;
          } else {
            step = len;
          }
        }
        shift += step;
        len -= step;
        if (transform === 21) len = 0;
      }
    }
    while (suffix !== suffixEnd) {
      dst[offset++] = this.prefixSuffixStorage[suffix++];
    }
    return offset - dstOffset;
  }
}
