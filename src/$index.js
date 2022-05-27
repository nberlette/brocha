import { gen } from './$utils'

const ESCAPE = /[&"<>]/g
const CHARS = {
  '"': '&quot;',
  '\'': '&apos;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}

export function esc(value) {
  value = value == null ? '' : `${value}`
  let last = (ESCAPE.lastIndex = 0)
  let tmp = 0
  let out = ''
  while (ESCAPE.test(value)) {
    tmp = ESCAPE.lastIndex - 1
    out += String(value).substring(last, tmp) + CHARS[value[tmp]]
    last = tmp + 1
  }
  return out + value.substring(last)
}

export function compile(input, options = {}) {
  return new (options.async ? (async () => {}).constructor : Function)('$$1', '$$2', '$$3', gen(input, options)).bind(
    0,
    options.escape || esc,
    options.blocks,
  )
}

export function transform(input, options = {}) {
  return `${
    (options.format === 'cjs'
      ? 'var $$1=require("brocha").esc;module.exports='
      : 'import{esc as $$1}from"brocha";export default ') + (options.async ? 'async ' : '')
  }function($$3,$$2){${gen(input, options)}}`
}
