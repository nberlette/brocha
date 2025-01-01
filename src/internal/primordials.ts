// deno-lint-ignore-file no-explicit-any
// @ts-ignore TS9016

declare const global: typeof globalThis | undefined;
declare const root: typeof globalThis | undefined;
declare const self: typeof globalThis | undefined;
declare const window: typeof globalThis | undefined;

export const $global: typeof globalThis = (() => {
  if (typeof globalThis === "object" && !!globalThis) {
    return globalThis;
  }
  try {
    return (0, eval)("this");
  } catch {
    if (typeof global === "object" && !!global) {
      return global;
    } else if (typeof window === "object" && !!window) {
      return window;
    } else if (typeof root === "object" && !!root) {
      return root;
    } else if (typeof self === "object" && !!self) {
      return self;
    } else if (typeof this === "object" && !!this) {
      return this;
    }
    throw {
      message: "Unable to locate global `this`",
      toString() {
        return this.message;
      },
    };
  }
})();

export type UncurryThis = {
  <T, A extends readonly unknown[], R>(
    fn: (this: T, ...args: A) => R,
    thisArg?: T,
  ): [T] extends [never] ? (thisArg: unknown, ...args: A) => R
    : (thisArg: T, ...args: A) => R;
};

export type Uncurry<T, This = void> = T extends
  (this: infer ThisArg, ...args: infer A) => infer R
  ? [This] extends [void] ? (thisArg: ThisArg, ...args: A) => R
  : (thisArg: This, ...args: A) => R
  : T extends (...args: infer A) => infer R
    ? (thisArg: [This] extends [void] ? unknown : This, ...args: A) => R
  : never;

export type UncurryGetter<T, This = void> = T extends { get(): infer R }
  ? UncurryGetter<R, This>
  : [This] extends [void] ? UncurryGetter<T, unknown>
  : (thisArg: This) => T;

export type UncurrySetter<T, This = void> = T extends
  { set(value: infer R): void } ? UncurrySetter<R, This>
  : [This] extends [void] ? UncurrySetter<T, unknown>
  : (thisArg: This, value: T) => void;

type ToValue<T, K extends PropertyKey, U extends boolean = false> = K extends
  keyof T ? Exclude<T[K], undefined> | ([U] extends [true] ? undefined : never)
  : unknown;

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float16ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | BigInt64ArrayConstructor
  | BigUint64ArrayConstructor;

export type TypedArray = TypedArrayConstructor extends
  abstract new (...args: any) => infer T ? T : never;

export type TypedArrayToStringTag = TypedArray[typeof Symbol.toStringTag];

export type TypedArrayFromTag<T extends TypedArrayToStringTag> =
  TypedArray extends infer A extends TypedArray
    ? A extends { [Symbol.toStringTag]: T } ? A : never
    : never;

export const Object: typeof globalThis.Object = $global.Object;
export const ObjectGetPrototypeOf = Object.getPrototypeOf;
export const ObjectDefineProperty = Object.defineProperty;
export const ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
export const ObjectFreeze: typeof Object.freeze = Object.freeze;

const { bind, call } = $global.Function.prototype;

export const uncurryThis: UncurryThis = (fn) => {
  const bound = bind.call(call, fn);
  ObjectDefineProperty(bound, "name", { value: fn.name });
  return bound;
};

export function uncurryGetter<T, K extends keyof T>(
  o: T,
  p: K,
): UncurryGetter<T[K], T> {
  return uncurryThis(lookupGetter(o, p)) as unknown as UncurryGetter<T[K], T>;
}

export function uncurrySetter<T, K extends keyof T>(
  o: T,
  p: K,
): UncurrySetter<T[K], T> {
  return uncurryThis(lookupSetter(o, p)) as unknown as UncurrySetter<T[K], T>;
}

export function lookupGetter<
  T,
  K extends PropertyKey = keyof T,
  U extends boolean = false,
>(
  o: T,
  p: K,
  _allowUndefined?: U,
): () => ToValue<T, K, U> {
  return ObjectGetOwnPropertyDescriptor(o, p)?.get ?? (() => undefined);
}

export function lookupSetter<
  T,
  K extends PropertyKey = keyof T,
  U extends boolean = false,
>(
  o: T,
  p: K,
  _allowUndefined?: U,
): (value: ToValue<T, K, U>) => void {
  return ObjectGetOwnPropertyDescriptor(o, p)?.set ?? (() => undefined);
}

export const toString: (self: unknown) => string = uncurryThis(
  Object.prototype.toString,
);

export const Error: typeof globalThis.Error = $global.Error;
export const TypeError: typeof globalThis.TypeError = $global.TypeError;
export const RangeError: typeof globalThis.RangeError = $global.RangeError;
export const ReferenceError: typeof globalThis.ReferenceError =
  $global.ReferenceError;

export const Array: typeof globalThis.Array = $global.Array;
export const Symbol: typeof globalThis.Symbol = $global.Symbol;

export const String: typeof globalThis.String = $global.String;
export const StringFromCharCode: typeof String.fromCharCode =
  String.fromCharCode;
export const StringPrototype: typeof String.prototype = String.prototype;
export const StringPrototypeCharCodeAt: Uncurry<
  typeof String.prototype.charCodeAt,
  string
> = uncurryThis(StringPrototype.charCodeAt);
export const StringPrototypeReplace: Uncurry<
  typeof String.prototype.replace,
  string
> = uncurryThis(StringPrototype.replace);
export const StringPrototypeSlice: Uncurry<
  typeof String.prototype.slice,
  string
> = uncurryThis(StringPrototype.slice);
export const StringPrototypeCodePointAt: Uncurry<
  typeof String.prototype.codePointAt,
  string
> = uncurryThis(StringPrototype.codePointAt);
export const StringPrototypeToLowerCase: Uncurry<
  typeof String.prototype.toLowerCase,
  string
> = uncurryThis(StringPrototype.toLowerCase);

export const ArrayBuffer: typeof globalThis.ArrayBuffer = $global.ArrayBuffer;
export type ArrayBuffer = InstanceType<typeof ArrayBuffer>;

export const ArrayBufferIsView: (x: unknown) => x is ArrayBufferView =
  ArrayBuffer.isView;
export const ArrayBufferPrototype: ArrayBuffer = ArrayBuffer.prototype;
export const ArrayBufferPrototypeGetByteLength: (self: unknown) => number =
  uncurryThis(
    lookupGetter(ArrayBuffer.prototype, "byteLength"),
  );

export const SharedArrayBuffer: typeof globalThis.SharedArrayBuffer =
  $global.SharedArrayBuffer;
export type SharedArrayBuffer = globalThis.SharedArrayBuffer;

export const SharedArrayBufferPrototype: SharedArrayBuffer =
  SharedArrayBuffer.prototype;
export const SharedArrayBufferPrototypeGetByteLength: (
  self: unknown,
) => number = uncurryThis(
  lookupGetter(SharedArrayBuffer.prototype, "byteLength"),
);

export const Uint8Array: Uint8ArrayConstructor = $global.Uint8Array;
export type Uint8Array = globalThis.Uint8Array;
export const Uint8ArrayPrototypeSlice: Uncurry<
  typeof Uint8Array.prototype.slice,
  Uint8Array
> = uncurryThis(Uint8Array.prototype.slice);

export const Uint8ArrayPrototypeSubarray: Uncurry<
  typeof Uint8Array.prototype.subarray,
  Uint8Array
> = uncurryThis(Uint8Array.prototype.subarray);

export const DataView: DataViewConstructor = $global.DataView;
export type DataView = globalThis.DataView;

export const Int16Array: Int16ArrayConstructor = $global.Int16Array;
export type Int16Array = globalThis.Int16Array;
export const Int16ArrayOf: (...n: number[]) => Int16Array = Int16Array?.of.bind(
  Int16Array,
);

export const Int32Array: Int32ArrayConstructor = $global.Int32Array;
export type Int32Array = globalThis.Int32Array;
export const Int32ArrayOf: (...n: number[]) => Int32Array = Int32Array?.of.bind(
  Int32Array,
);

export const Int8Array: Int8ArrayConstructor = $global.Int8Array;
export type Int8Array = globalThis.Int8Array;

export const TypedArray: TypedArrayConstructor = ObjectGetPrototypeOf(
  Uint8Array,
);
export const TypedArrayPrototype: InstanceType<TypedArrayConstructor> =
  TypedArray?.prototype!;
export const TypedArrayPrototypeGetToStringTag: (
  this: unknown,
) =>
  | "Int8Array"
  | "BigUint64Array"
  | "Uint8Array"
  | "Int16Array"
  | "Int32Array"
  | "Uint8ClampedArray"
  | "Uint16Array"
  | "Uint32Array"
  | "Float16Array"
  | "Float32Array"
  | "Float64Array"
  | "BigInt64Array" = lookupGetter(
    TypedArrayPrototype,
    Symbol.toStringTag,
  );
export const TypedArrayPrototypeSubarray: Uncurry<
  typeof TypedArrayPrototype.subarray,
  typeof TypedArrayPrototype
> = uncurryThis(TypedArrayPrototype.subarray as any) as any;
