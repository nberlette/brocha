/* eslint-disable no-tabs */
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import * as brocha from '../src/$index'

// ---

const transform = suite('transform')

transform('should be a function', () => {
  assert.type(brocha.transform, 'function')
})

transform('should return a string', () => {
  const output = brocha.transform('')
  assert.type(output, 'string')
})

transform('should include "esc" import from "brocha" module', () => {
  const output = brocha.transform('')
  assert.match(output, /\{esc(\:| as )/)
  assert.match(output, '"brocha"')
})

transform('format :: ESM (default)', () => {
  const output = brocha.transform('')
  assert.match(output, 'import{esc as $$1}from"brocha";')
  assert.match(output, ';export default function($$3,$$2){')
  assert.ok(output.endsWith('}'), 'close function')
})

transform('format :: ESM :: async', () => {
  const output = brocha.transform('', { async: true })
  assert.match(output, ';export default async function($$3,$$2){')
})

transform('format :: CommonJS', () => {
  const output = brocha.transform('', { format: 'cjs' })
  assert.match(output, 'var $$1=require("brocha").esc;')
  assert.match(output, ';module.exports=function($$3,$$2){')
  assert.ok(output.endsWith('}'), 'close function')
})

transform('format :: CommonJS :: async', () => {
  const output = brocha.transform('', { format: 'cjs', async: true })
  assert.match(output, ';module.exports=async function($$3,$$2){')
})

transform('should bubble parsing errors', () => {
  try {
    brocha.transform('{{#if foo}}stop')
    assert.unreachable('should have thrown')
  } catch (err) {
    assert.instance(err, Error)
    assert.is(err.message, 'Unterminated "if" block')
  }
})

transform.run()

// ---

const compile = suite('compile')

compile('should be a function', () => {
  assert.type(brocha.compile, 'function')
})

compile('should return a function', () => {
  const output = brocha.compile('')
  assert.type(output, 'function')
})

compile('should produce valid output :: raw', () => {
  const output = brocha.compile(`
		{{#expect value}}
		{{#if value.length > 10}}
			"{{{ value }}}" is more than 10 characters
		{{#else}}
			"{{{ value }}}" is too short
		{{/if}}
	`)

  assert.is(output({ value: '<b>howdy</b>' }).replace(/[\r\n\t]+/g, ''), '"<b>howdy</b>" is more than 10 characters')

  assert.is(output({ value: '<b>aaa</b>' }).replace(/[\r\n\t]+/g, ''), '"<b>aaa</b>" is too short')
})

compile('should produce valid output :: escape', () => {
  const output = brocha.compile(`
		{{#expect value}}
		{{#if value.length > 10}}
			"{{ value }}" is more than 10 characters
		{{#else}}
			"{{ value }}" is too short
		{{/if}}
	`)

  assert.is(
    output({ value: '<b>howdy</b>' }).replace(/[\r\n\t]+/g, ''),
    '"&lt;b&gt;howdy&lt;/b&gt;" is more than 10 characters',
  )

  assert.is(output({ value: '<b>aaa</b>' }).replace(/[\r\n\t]+/g, ''), '"&lt;b&gt;aaa&lt;/b&gt;" is too short')
})

compile('should allow custom `escape` option :: {{value}}', () => {
  const output = brocha.compile(
    `
		{{#expect value}}
		value is "{{ value }}"
	`,
    {
      escape(val) {
        return val.replace('foo', 'bar')
      },
    },
  )

  assert.is(output({ value: 'foobar' }).replace(/[\r\n\t]+/g, ''), 'value is "barbar"')
})

compile('should allow custom `escape` option :: {{{ value }}}', () => {
  const output = brocha.compile(
    `
		{{#expect value}}
		value is "{{{ value }}}"
	`,
    {
      escape(val) {
        return val.replace('foo', 'bar')
      },
    },
  )

  assert.is(output({ value: 'foobar' }).replace(/[\r\n\t]+/g, ''), 'value is "foobar"')
})

compile('should bubble parsing errors', () => {
  try {
    brocha.compile('{{#if foo}}stop')
    assert.unreachable('should have thrown')
  } catch (err) {
    assert.instance(err, Error)
    assert.is(err.message, 'Unterminated "if" block')
  }
})

compile('should create `async` function', async () => {
  let delta
  // eslint-disable-next-line promise/param-names
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const normalize = x => x.replace(/[\r\n\t]+/g, '')

  async function delay({ wait }) {
    const x = Date.now()

    await sleep(wait)
    delta = Date.now() - x
    return `~> waited ${wait}ms!`
  }

  const render = brocha.compile(
    `
		{{#expect ms}}
		{{#delay wait=ms }}
	`,
    {
      async: true,
      blocks: { delay },
    },
  )

  assert.instance(render, Function)
  assert.instance(render, delay.constructor)

  assert.is(Object.prototype.toString.call(render), '[object AsyncFunction]')

  const foo = await render({ ms: 100 })
  assert.is(normalize(foo), '~> waited 100ms!')
  assert.ok(delta > 99 && delta < 110)

  const bar = await render({ ms: 30 })
  assert.is(normalize(bar), '~> waited 30ms!')
  assert.ok(delta > 29 && delta < 35)
})

compile('should allow `blocks` to call other blocks', () => {
  const blocks = {
    hello(args, blocks) {
      let output = `<h>"${args.name}"</h>`
      // Always invoke the `foo` block
      output += blocks.foo({ value: 123 })
      // Calls itself; recursive block
      if (args.other)
        output += blocks.hello({ name: args.other }, blocks)
      return output
    },
    foo(args) {
      return `<foo>${args.value}</foo>`
    },
  }

  const render = brocha.compile('{{#hello name="world" other="there"}}', { blocks })

  assert.is(render(), '<h>"world"</h><foo>123</foo><h>"there"</h><foo>123</foo>')
})

compile('should allow `Compiler` output as blocks', () => {
  const blocks = {
    // initialize foo
    // ~> does NOT use custom blocks
    foo: brocha.compile(`
			{{#expect age}}
			{{#if age > 100}}
				<p>centurion</p>
			{{#else}}
				<p>youngin</p>
			{{/if}}
		`),

    // initial hello
    // ~> placeholder; because self-references
    hello: null,
  }

  blocks.hello = brocha.compile(
    `
		{{#expect name, other}}

		<h>"{{ name }}"</h>
		{{#foo age=123}}

		{{#if other}}
			{{#hello name=other}}
		{{/if}}
	`,
    { blocks },
  )

  const normalize = x => x.replace(/[\r\n\t]+/g, '')
  const render = brocha.compile('{{#hello name="world" other="there"}}', { blocks })

  assert.is(normalize(render()), '<h>"world"</h><p>centurion</p><h>"there"</h><p>centurion</p>')
})

compile.run()

// ---

const esc = suite('esc')

esc('should be a function', () => {
  assert.type(brocha.esc, 'function')
})

esc('should convert non-string inputs to string', () => {
  assert.is(brocha.esc(), '')
  assert.is(brocha.esc(null), '')

  assert.is(brocha.esc(false), 'false')
  assert.is(brocha.esc(123), '123')
  assert.is(brocha.esc(0), '0')

  assert.equal(brocha.esc([1, 2, 3]), '1,2,3')
  assert.equal(brocha.esc({ foo: 1 }), '[object Object]')
})

esc('should prevent xss scripting in array', () => {
  const output = brocha.esc(['<img src=x onerror="alert(1)" />'])
  assert.is(output, '&lt;img src=x onerror=&quot;alert(1)&quot; /&gt;')
})

esc('should return string from string input', () => {
  assert.type(brocha.esc(''), 'string')
  assert.type(brocha.esc('foobar'), 'string')
})

esc('should escape `<` character', () => {
  assert.is(brocha.esc('here: <'), 'here: &lt;')
})

esc('should escape `"` character', () => {
  assert.is(brocha.esc('here: "'), 'here: &quot;')
})

esc('should escape `&` character', () => {
  assert.is(brocha.esc('here: &'), 'here: &amp;')
})

esc('should escape all target characters in a string', () => {
  assert.is(brocha.esc('&&& <<< """'), '&amp;&amp;&amp; &lt;&lt;&lt; &quot;&quot;&quot;')
})

esc('should reset state on same input string', () => {
  const input = '<foo>"hello"</foo>'

  assert.is(brocha.esc(input), '&lt;foo&gt;&quot;hello&quot;&lt;/foo&gt;')

  assert.is(brocha.esc(input), '&lt;foo&gt;&quot;hello&quot;&lt;/foo&gt;', '~> repeat')
})

esc.run()
