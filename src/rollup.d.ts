import { type Args, type Options } from 'brocha'
import { type Plugin } from 'rollup'

namespace Brocha {
  declare type Options = import('brocha')
}

export type BrochaTransformOptions = Brocha.Options & {
  /**
   * Pattern to match
   * @default /\.(hbs|bro)$/
   */
  filter?: RegExp
  /**
   * Output format.
   * Defaults to esbuild value.
   */
  format?: 'esm' | 'cjs'
}

export type BrochaCompileOptions = Options & {
  /**
   * Pattern to match
   * @default /\.(hbs|bro)$/
   */
  filter?: RegExp
  /**
   * The input argument(s) to provide each template.
   * Function receives the template's file path.
   */
  values?: (file: string) => Promise<Args | void> | Args | void
  /**
   * Optional minifier function.
   * Runs *after* the template has been rendered.
   */
  minify?: (result: string) => string
}

export function transform(options?: BrochaTransformOptions): Plugin

export function compile(options?: BrochaCompileOptions): Plugin
