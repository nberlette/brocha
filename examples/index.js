const { join } = require('path')
const { readFileSync } = require('fs')
const { readFile } = require('fs/promises')
const { compile } = require('../dist')

const user = {
  firstname: 'Nicholas',
  lastname: 'Berlette',
  avatar: 'https://github.com/nberlette.png?v=4',
}

const examples = ['basic.hbs', 'blocks.hbs']
const Cache = {};

/**
 * Defines a single instance of blocks, shared across all examples.
 */
const blocks = {
  heading({ level = 1, className = 'title', text }) {
    const tagName = level || 1;
    return `<${tagName} class="${className}">${text}</${tagName}>`
  },
  h1(args) {
    return heading({ level: 1, ...args })
  },
  h2(args) {
    return heading({ level: 2, ...args })
  },
  include(args) {
    const { src, ...rest } = args
    const render = Cache[src] || compile(readFileSync(file, 'utf8'), { blocks })
    return render(rest)
  },
}

(async function () {
  for (const name of examples) {
    let render = Cache[name]

    if (!render) {
      const file = join(__dirname, name)
      const data = await readFile(file, 'utf8')
      render = Cache[name] = compile(data, { blocks })
    }
    console.log('\n\n>>>', name)
    console.log(render(user))
  }
})().catch((err) => {
  console.error('Oops', err.stack)
  process.exitCode = 1
})
