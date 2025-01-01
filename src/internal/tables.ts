import {
  Int16ArrayOf,
  Int32Array,
  Int32ArrayOf,
  StringPrototypeCharCodeAt,
} from "./primordials.ts";

// #region Offsets, Lengths, and Sizes
/**
 * Represents the maximum number of symbols in a Huffman table. This is used to
 * calculate the maximum number of bits required to represent a Huffman code.
 * @category Constants
 */
// deno-fmt-ignore
export const MAX_HUFFMAN_TABLE_SIZE: Int32Array = Int32ArrayOf(
  256, 402, 436, 468, 500, 534, 566, 598, 630, 662, 694, 726, 758, 790, 822,
  854, 886, 920, 952, 984, 1016, 1048, 1080,
);

/**
 * Controls the order of the Huffman code lengths.
 * @category Constants
 */
// deno-fmt-ignore
export const CODE_LENGTH_CODE_ORDER: Int32Array = Int32ArrayOf(
  0x1, 0x2, 0x3, 0x4, 0x0, 0x5, 0x11, 0x6, 0x10, 0x7, 0x8, 0x9,
  0xA, 0xB,0xC, 0xD, 0xE, 0xF,
);

/**
 * Index offsets for the distance symbol code lengths.
 * @category Constants
 */
// deno-fmt-ignore
export const DSC_INDEX_OFFSET: Int32Array = Int32ArrayOf(
  0, 3, 2, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3,
);

/**
 * Value offsets for the distance symbol code lengths.
 * @category Constants
 */
// deno-fmt-ignore
export const DSC_VALUE_OFFSET: Int32Array = Int32ArrayOf(
  0, 0, 0, 0, -1, 1, -2, 2, -3, 3, -1, 1, -2, 2, -3, 3,
);

/**
 * The fixed Huffman literal code lengths.
 * @category Constants
 */
// deno-fmt-ignore
export const FIXED_TABLE: Int32Array = Int32ArrayOf(
  0x020000, 0x020004, 0x020003, 0x030002, 0x020000, 0x020004, 0x020003,
  0x040001, 0x020000, 0x020004, 0x020003, 0x030002, 0x020000, 0x020004,
  0x020003, 0x040005,
);

/**
 * Block length offsets for the block types.
 * @category Constants
 */
// deno-fmt-ignore
export const BLOCK_LENGTH_OFFSET: Int32Array = Int32ArrayOf(
  1, 5, 9, 13, 17, 25, 33, 41, 49, 65, 81, 97, 113, 145, 177, 209, 241, 305,
  369, 497, 753, 1265, 2289, 4337, 8433, 16625,
);

/**
 * Represents the number of bits required to represent the block lengths.
 * @category Constants
 */
// deno-fmt-ignore
export const BLOCK_LENGTH_N_BITS: Int32Array = Int32ArrayOf(
  0x02, 0x02, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03, 0x04, 0x04, 0x04, 0x04, 0x05,
  0x05, 0x05, 0x05, 0x06, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x18,
);

/**
 * The number of bits required to represent the insert length.
 * @category Constants
 */
// deno-fmt-ignore
export const INSERT_LENGTH_N_BITS: Int16Array = Int16ArrayOf(
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03,
  0x04, 0x04, 0x05, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0C, 0x0E, 0x18,
);

/**
 * The number of bits required to represent the copy length.
 * @category Constants
 */
// deno-fmt-ignore
export const COPY_LENGTH_N_BITS: Int16Array = Int16ArrayOf(
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02,
  0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x18,
);
// #endregion Offsets, Lengths, and Sizes

// #region Lookup Tables
export const LOOKUP: Int32Array = unpackLookupTable(new Int32Array(2048));

export const COMMAND_LOOKUP_TABLE: Int16Array = unpackCommandLookupTable(
  new Int16Array(2816),
);

function unpackCommandLookupTable(cmdLookup: Int16Array): Int16Array {
  const insertLengthOffsets = new Int32Array(24);
  const copyLengthOffsets = new Int32Array(24);
  copyLengthOffsets[0] = 2;
  for (let i = 0; i < 23; ++i) {
    insertLengthOffsets[i + 1] = insertLengthOffsets[i] +
      (1 << INSERT_LENGTH_N_BITS[i]);
    copyLengthOffsets[i + 1] = copyLengthOffsets[i] +
      (1 << COPY_LENGTH_N_BITS[i]);
  }
  for (let cmdCode = 0; cmdCode < 704; ++cmdCode) {
    let rangeIdx = cmdCode >>> 6;
    let distanceContextOffset = -4;
    if (rangeIdx >= 2) {
      rangeIdx -= 2;
      distanceContextOffset = 0;
    }
    const insertCode = (((0x29850 >>> (rangeIdx * 2)) & 0x3) << 3) |
      ((cmdCode >>> 3) & 7);
    const copyCode = (((0x26244 >>> (rangeIdx * 2)) & 0x3) << 3) |
      (cmdCode & 7);
    const copyLengthOffset = copyLengthOffsets[copyCode];
    const distanceContext = distanceContextOffset +
      (copyLengthOffset > 4 ? 3 : (copyLengthOffset - 2));
    const index = cmdCode * 4;
    cmdLookup[index] = INSERT_LENGTH_N_BITS[insertCode] |
      (COPY_LENGTH_N_BITS[copyCode] << 8);
    cmdLookup[index + 1] = insertLengthOffsets[insertCode];
    cmdLookup[index + 2] = copyLengthOffsets[copyCode];
    cmdLookup[index + 3] = distanceContext;
  }

  return cmdLookup;
}

function unpackLookupTable(lookup: Int32Array): Int32Array {
  const map =
    "         !!  !                  \"#$##%#$&'##(#)#++++++++++((&*'##,---,---,-----,-----,-----&#'###.///.///./////./////./////&#'# ";
  const rle = "A/*  ':  & : $  \x81 @";

  for (let i = 0; i < 256; ++i) {
    lookup[i] = i & 0x3F;
    lookup[512 + i] = i >> 2;
    lookup[1792 + i] = 2 + (i >> 6);
  }
  for (let i = 0; i < 128; ++i) {
    lookup[1024 + i] = 4 * (StringPrototypeCharCodeAt(map, i) - 32);
  }
  for (let i = 0; i < 64; ++i) {
    lookup[1152 + i] = i & 1;
    lookup[1216 + i] = 2 + (i & 1);
  }
  let offset = 1280;
  for (let k = 0; k < 19; ++k) {
    const value = k & 3;
    const rep = rle.charCodeAt(k) - 32;
    for (let i = 0; i < rep; ++i) lookup[offset++] = value;
  }
  for (let i = 0; i < 16; ++i) lookup[1792 + i] = 1, lookup[2032 + i] = 6;
  lookup[1792] = 0, lookup[2047] = 7;
  for (let i = 0; i < 256; ++i) lookup[1536 + i] = lookup[1792 + i] << 3;

  return lookup;
}
// #endregion Lookup Tables

// #region Huffman table functions
function getNextKey(key: number, len: number): number {
  let step = 1 << (len - 1);
  while ((key & step) !== 0) step = step >> 1;
  return (key & (step - 1)) + step;
}

function replicateValue(
  table: Int32Array,
  offset: number,
  step: number,
  end: number,
  item: number,
): void {
  let pos = end;
  do {
    pos -= step;
    table[offset + pos] = item;
  } while (pos > 0);
}

function nextTableBitSize(
  count: Int32Array,
  len: number,
  rootBits: number,
): number {
  let bits = len, left = 1 << (bits - rootBits);
  while (bits < 15) {
    left -= count[bits];
    if (left <= 0) break;
    bits++;
    left <<= 1;
  }
  return bits - rootBits;
}

export function buildHuffmanTable(
  tableGroup: Int32Array,
  tableIdx: number,
  rootBits: number,
  codeLengths: Int32Array,
  codeLengthsSize: number,
): number {
  const tableOffset = tableGroup[tableIdx];
  const sorted = new Int32Array(codeLengthsSize);
  const count = new Int32Array(16), offset = new Int32Array(16);

  for (let sym = 0; sym < codeLengthsSize; ++sym) count[codeLengths[sym]]++;

  offset[1] = 0;
  for (let len = 1; len < 15; ++len) {
    offset[len + 1] = offset[len] + count[len];
  }
  for (let sym = 0; sym < codeLengthsSize; ++sym) {
    if (codeLengths[sym] !== 0) {
      sorted[offset[codeLengths[sym]]++] = sym;
    }
  }
  let tableBits = rootBits, tableSize = 1 << tableBits, totalSize = tableSize;
  if (offset[15] === 1) {
    for (let k = 0; k < totalSize; ++k) {
      tableGroup[tableOffset + k] = sorted[0];
    }
    return totalSize;
  }

  let key = 0, symbol = 0, step = 1;
  for (let len = 1; len <= rootBits; ++len) {
    step <<= 1;
    while (count[len] > 0) {
      replicateValue(
        tableGroup,
        tableOffset + key,
        step,
        tableSize,
        len << 16 | sorted[symbol++],
      );
      key = getNextKey(key, len);
      count[len]--;
    }
  }

  const mask = totalSize - 1;
  let low = -1, currentOffset = tableOffset;
  step = 1;

  for (let len = rootBits + 1; len <= 15; ++len) {
    step <<= 1;

    while (count[len] > 0) {
      if ((key & mask) !== low) {
        currentOffset += tableSize;
        tableBits = nextTableBitSize(count, len, rootBits);
        tableSize = 1 << tableBits;
        totalSize += tableSize;
        low = key & mask;
        tableGroup[tableOffset + low] = (tableBits + rootBits) << 16 |
          (currentOffset - tableOffset - low);
      }

      replicateValue(
        tableGroup,
        currentOffset + (key >> rootBits),
        step,
        tableSize,
        (len - rootBits) << 16 | sorted[symbol++],
      );

      key = getNextKey(key, len);
      count[len]--;
    }
  }

  return totalSize;
}
// #endregion Huffman table functions
