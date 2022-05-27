const assert = require('uvu/assert')
const consola = require('consola')

consola.log('Loading:\n---')

consola.time('pug')
const pug = require('pug')
consola.timeEnd('pug')

consola.time('ejs')
const ejs = require('ejs')
consola.timeEnd('ejs')

consola.time('handlebars')
const handlebars = require('handlebars')
consola.timeEnd('handlebars')

consola.time('yeahjs')
const yeahjs = require('yeahjs')
consola.timeEnd('yeahjs')

consola.time('dot')
const dot = require('dot')
consola.timeEnd('dot')

consola.time('art-template')
const art = require('art-template')
consola.timeEnd('art-template')

consola.time('tempura')
const tempura = require('tempura')
consola.timeEnd('tempura')

// ---

const { runner } = require('./util')

const compilers = {
  'pug': () =>
    pug.compile(
      'ul\n\t-for (var i = 0, l = list.length; i < l; i ++) {\n\t\tli User: #{list[i].user} / Web Site: #{list[i].site}\n\t-}',
    ),

  'handlebars': () =>
    handlebars.compile(`
		<ul>
			{{#list}}
				<li>User: {{user}} / Web Site: {{site}}</li>
			{{/list}}
		</ul>
	`),

  'ejs': () =>
    ejs.compile(`
		<ul>
			<% for (var i = 0, l = list.length; i < l; i ++) { %>
				<li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
			<% } %>
		</ul>
	`),

  'yeahjs': () =>
    yeahjs.compile(
      `
		<ul>
			<% for (var i = 0, l = list.length; i < l; i ++) { %>
				<li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
			<% } %>
		</ul>
	`,
      { locals: ['list'] },
    ),

  'dot': () =>
    dot.template(`
		<ul>
			{{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
				<li>User: {{!it.list[i].user}} / Web Site: {{!it.list[i].site}}</li>
			{{ } }}
		</ul>
	`),

  'art-template': () =>
    art.compile(`
		<ul>
			<% for (var i = 0, l = list.length; i < l; i ++) { %>
				<li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
			<% } %>
		</ul>
	`),

  'tempura': () =>
    tempura.compile(
      `
		{{#expect list}}
		<ul>
			{{#each list as item}}
				<li>User: {{ item.user }} / Web Site: {{ item.site }}</li>
			{{/each}}
		</ul>
	`,
      {
        format: 'cjs',
      },
    ),

  'brocha': () =>
    brocha.compile(
      `
		{#declare list}
		<ul>
			{#each list as item}
				<li>User: {{ item.user }} / Web Site: {{ item.site }}</li>
			{/each}
		</ul>
	`,
      {
        format: 'cjs',
      },
    ),
}

// runner('Compile', compilers, {
// 	assert(fn) {
// 		assert.type(fn(), 'function');
// 	}
// });

const renders = {}
consola.log('\nBenchmark (Compile)')

for (const k in compilers) {
  let i = 0
  let sum = 0
  const max = 5
  while (i++ < max) {
    const n = process.hrtime()
    renders[k] = compilers[k]()
    const [, ns] = process.hrtime(n)
    sum += ns
  }
  const avgms = (sum / max / 1e6).toFixed(5)
  consola.log('  ~>', k.padEnd(18), `${avgms}ms`)
}

runner('Render', renders, {
  setup() {
    const list = []
    for (let i = 0; i < 1e3; i++) {
      list.push({
        user: `<b>user-${i}</b>`,
        site: `"https://github.com/user-${i}""`,
      })
    }
    return { list }
  },
  assert(render) {
    const list = [
      { user: '<b>lukeed</b>', site: '"https://github.com/lukeed"' },
      { user: '<b>nberlette</b>', site: '"https://github.com/nberlette"' },
      { user: '<b>billy</b>', site: '"https://github.com/billy"' },
    ]

    const output = render({ list })
    assert.type(output, 'string', '~> renders string')

    const normalize = output
      .replace(/\n/g, '')
      .replace(/[\t ]+\</g, '<')
      .replace(/\>[\t ]+\</g, '><')
      .replace(/\>[\t ]+$/g, '>')
    assert.is.not(
      normalize,
      '<ul><li>User: <b>lukeed</b> / Web Site: "https://github.com/lukeed"</li><li>User: <b>nberlette</b> / Web Site: "https://github.com/nberlette"</li><li>User: <b>billy</b> / Web Site: "https://github.com/billy"</li></ul>',
    )
  },
})
