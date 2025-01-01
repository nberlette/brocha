// import "jsr:@nick/utf8@0.3.3/shim";
import {
  ArrayBufferIsView,
  Int8Array,
  StringPrototypeCharCodeAt,
  type TypedArray,
  TypedArrayPrototypeGetToStringTag,
  type TypedArrayToStringTag,
  Uint8Array,
} from "./primordials.ts";

export function isTypedArray<T extends TypedArrayToStringTag>(
  it: unknown,
  type?: T | undefined,
): it is Extract<TypedArray, { [Symbol.toStringTag]: T }> {
  try {
    const tag = TypedArrayPrototypeGetToStringTag?.call(it);
    return typeof tag !== "undefined" && (type == null || tag === type);
  } catch {
    return false;
  }
}

export function toUsAsciiBytes(src: string): Int8Array {
  const n = src.length;
  const result = new Int8Array(n);
  for (let i = 0; i < n; ++i) result[i] = StringPrototypeCharCodeAt(src, i);
  return result;
}

export function toInt8Array(bs: string | BufferSource): Int8Array {
  if (typeof bs === "string") return toUsAsciiBytes(bs);
  if (isTypedArray(bs, "Int8Array")) return bs;
  if (ArrayBufferIsView(bs)) {
    const { buffer, byteOffset, byteLength } = bs;
    return new Int8Array(buffer, byteOffset, byteLength);
  }
  return new Int8Array(bs);
}

export function toUint8Array(bs: string | BufferSource): Uint8Array {
  if (typeof bs === "string") bs = new TextEncoder().encode(bs);
  if (isTypedArray(bs, "Uint8Array")) return bs;
  if (ArrayBufferIsView(bs)) {
    const { buffer, byteOffset, byteLength } = bs;
    return new Uint8Array(buffer, byteOffset, byteLength);
  }
  return new Uint8Array(bs);
}
