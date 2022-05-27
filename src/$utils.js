import consola from 'consola'

const ENDLINES = /[\r\n]+$/g
const CURLY = /[{]{2,3}[\s\t\r\n]*([\s\S]*?)[\s\t\r\n]*[}]{2,3}/g
const VAR = /(?:^|[-*+^|%/&=\s])([a-zA-Z$_][\w$]*)(?:(?=$|[-*+^|%/&=\s]))/g
const ARGS = /([a-zA-Z$_][^\s=]*)\s*=\s*((["`'])(?:(?=(\\?))\4.)*?\3|[{][^}]*[}]|\[[^\]]*]|\S+)/g
const COMMENTS = /(?:^|[/][*]{1,2})([^]*?)(?:(?=$|[*][/]))/g

// $$1 = escape()
// $$2 = extra blocks
// $$3 = template values
/**
 * Generate a brocha compiler instance.
 *
 * @param {Input} input
 * @param {GenOptions} options
 * @returns
 */
export function gen(input, options = {}) {
  let char, num, action, tmp
  let last = (CURLY.lastIndex = 0)
  let wip = ''
  let txt = ''
  let match
  let inner

  const extra = options.values || {}

  const stack = []
  const locals = new Set(options.props || [])

  function close() {
    if (wip.length > 0)
      txt += `${txt ? 'x+=' : '='}\`${wip}\`;`
    else if (txt.length === 0)
      txt = '="";'

    wip = ''
  }

  while ((match = CURLY.exec(input))) {
    wip += input.substring(last, match.index).replace(ENDLINES, '')
    last = match.index + match[0].length

    inner = match[1].trim()
    char = inner.charAt(0)

    if (char === '!' || COMMENTS.test(inner)) {
      // comment, continue
      // const [comments] = COMMENTS.exec(inner);
    } else if (inner.startsWith('#') || inner.startsWith('@')) {
      close();
      [, action, inner] = /^[@#]\s*(\w[\w\d]+)\s*([^]*)/.exec(inner)

      if (/^\b(expect|declare)\b$/i.test(action)) {
        // declare
        locals.add([...inner.split(/[\n\r\s\t]*,[\n\r\s\t]*/g).map(v => v.trim())])
      } else if (['var', 'let', 'const'].includes(action)) {
        // define
        if (!~inner.indexOf('=') && action !== 'const') {
          locals.add([...inner.split(/[\n\r\s\t]*,[\n\r\s\t]*/g).map(v => v.trim())])
        } else {
          num = inner.indexOf('=')
          tmp = inner.substring(0, num++).trim()
          inner = inner.substring(num).trim().replace(/[;]$/, '')
          const [, init = 'var'] = /(var|let|const)/i.exec(action)
          txt += `${init} ${tmp}=${inner};`
        }
      } else if (action === 'each') {
        // loop (each)
        num = inner.indexOf(' as ')
        stack.push(action)

        if (!~num) {
          txt += `for(var i=0,$$a=${inner};i<$$a.length;i++){`
        } else {
          tmp = inner.substring(0, num).trim()
          inner = inner.substring(num + 4).trim()
          const [item, idx = 'i'] = inner.replace(/[()\s]/g, '').split(',') // (item, idx?)
          txt += `for(var ${idx}=0,${item},$$a=${tmp};${idx}<$$a.length;${idx}++){${item}=$$a[${idx}];`
        }
      } else if (action === 'if') {
        txt += `if(${inner}){`
        stack.push(action)
      } else if (['elif', 'elseif'].includes(action)) {
        txt += `}else if(${inner}){`
      } else if (action === 'else') {
        txt += '}else{'
      } else if (action in extra) {
        if (inner) {
          tmp = []
          inner = ''
          let arg, val
          // parse arguments, `defer=true` -> `{ defer: true }`
          // eslint-disable-next-line no-cond-assign
          while (([arg, val] = ARGS?.exec(inner)?.slice(1))) tmp = [...tmp, `${arg}:${val}`]
          // tmp.push(match[1] + ':' + match[2]);

          if (tmp.length > 0)
            inner = ['{', tmp?.join(','), '}'].join('')
        }

        wip += `\${${options.async ? 'await ' : ''}$$2.${action}(${inner ?? '{}'},$$2)}`
      } else {
        consola.error(`Unknown "${action}" block!`)
      }
    } else if (char === '/') {
      action = inner.slice(1)
      inner = stack.pop()
      close()

      if (action === inner)
        txt += '}'
      else throw new Error(`Expected to close "${inner}" block; closed "${action}" instead`)
    } else {
      if (match[0].charAt(2) === '{')
        wip += `\${${inner}}` // {{{ raw }}}
      else wip += `\${$$1(${inner})}`
      if (options.loose)
        while ((tmp = VAR.exec(inner))) locals.add(tmp[1])
    }
  }

  if (stack.length > 0)
    throw new Error(`Unterminated "${stack.pop()}" block`)
  if (last < input.length)
    wip += input.substring(last).replace(ENDLINES, '')

  close()

  tmp = locals.size ? `{${[...locals].join()}}=$$3,x` : ' x'
  return `var${tmp + txt}return x`
}
