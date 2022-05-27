const { join } = require('path')
const { readFileSync } = require('fs')
const { readFile } = require('fs/promises')
const { compile } = require('../dist')

const user = {
  firstname: 'Luke',
  lastname: 'Edwards',
  avatar: 'https://avatars.githubusercontent.com/u/5855893?v=4',
}

const examples = ['basic.hbs', 'blocks.hbs']

// Define custom blocks
// ~> Shared w/ all examples
const blocks = {
  h1(args) {
    return `<h1 class="title">${args.text}</h1>`
  },
  include(args) {
    const { src, ...rest } = args
    const render = Cache[src] || compile(readFileSync(file, 'utf8'), { blocks })
    return render(rest)
  },
}

const Cache = {};

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
