import * as brocha from 'brocha'

export function transform(options) {
  let { filter, format, ...config } = options || {}

  filter = filter || /\.(hbs|bro(?:cha))$/

  return {
    name: 'brocha',
    transform(source, file) {
      if (!filter.test(file))
        return
      return brocha.transform(source, config)
    },
  }
}

export function compile(options) {
  let { filter, values, minify, ...config } = options || {}

  filter = filter || /\.(hbs|bro(?:cha))$/

  if (values && typeof values !== 'function')
    throw new Error('Must be a function: `options.values`')

  if (minify && typeof minify !== 'function')
    throw new Error('Must be a function: `options.minify`')

  return {
    name: 'brocha',
    async transform(source, file) {
      if (!filter.test(file))
        return

      const input = values && (await values(file))
      const render = brocha.compile(source, config)

      let result = await render(input || {})
      if (minify)
        result = minify(result)

      return `export default ${JSON.stringify(result)}`
    },
  }
}
