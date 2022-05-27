// @ts-check
import * as brocha from '../'

interface User {
  firstname: string
  lastname: string
  avatar: string
}

const user: User = {
  firstname: 'Nicholas',
  lastname: 'Berlette',
  avatar: 'https://github.com/nberlette.png?v=4',
}

// partial template #1
const image: brocha.Compiler<User> = brocha.compile(`
	{{#expect firstname, lastname, avatar}}
	<img src="{{ avatar }}" alt="{{ firstname }} {{ lastname }}" />
`)

// partial template #2
const greet: brocha.Compiler<User> = brocha.compile(
  `
	<p>Welcome back, {{ firstname }}!</p>
`,
  { loose: true },
)

// main template / render function
const render: brocha.Compiler<User> = brocha.compile(
  `
	{{#expect firstname, lastname, avatar}}
	<div class="avatar rounded-full w-8 h-8">
		{{#image firstname=firstname lastname=lastname avatar=avatar }}
	</div>
	{{#greet firstname=firstname }}
	<p>You have {{{ firstname.length }}} unread messages</p>
`,
  {
    async: false,
    blocks: { greet, image },
  },
)

const output = render(user)
console.log(output)
// => <div class="avatar rounded-full w-8 h-8">
// => 	 <img src="https://github.com/nberlette.png?v=4" alt="Nicholas Berlette" />
// => </div>
// => <p>Welcome back, Nicholas!</p>
// => <p>You have 8 unread messages</p>
