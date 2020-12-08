import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { transform } from '../src';

// ---

const values = suite('values');

values('{{ value }}', () => {
	assert.is(
		transform('{{ value }}'),
		'var x=`${xyz.value}`;return x'
	);

	assert.is(
		transform('{{value }}'),
		'var x=`${xyz.value}`;return x'
	);

	assert.is(
		transform('{{ value}}'),
		'var x=`${xyz.value}`;return x'
	);

	assert.is(
		transform('{{value}}'),
		'var x=`${xyz.value}`;return x'
	);
});

values('{{ foo.bar }}', () => {
	assert.is(
		transform('{{ foo.bar }}'),
		'var x=`${xyz.foo.bar}`;return x'
	);
});

values.skip('{{ foo["bar"] }}', () => {
	assert.is(
		transform('{{ foo["bar"] }}'),
		'var x=`${xyz.foo["bar"]}`;return x'
	);
});

values('<h1>{{ foo.bar }} ...</h1>', () => {
	assert.is(
		transform('<h1>{{ foo.bar }} <span>howdy</span></h1>'),
		'var x=`<h1>${xyz.foo.bar} <span>howdy</span></h1>`;return x'
	);
});

values.run();

// ---

// TODO: {{#if foo != 0}}
const control = suite('control');

control('{{#if isActive}}...{{/if}}', () => {
	assert.is(
		transform('{{#if isActive}}<p>yes</p>{{/if}}'),
		'var x="";if(xyz.isActive){x+=`<p>yes</p>`;}return x'
	);
});

control('{{#if foo.bar}}...{{#else}}...{{/if}}', () => {
	assert.is(
		transform('{{#if foo.bar}}<p>yes</p>{{#else}}<p>no {{ way }}</p>{{/if}}'),
		'var x="";if(xyz.foo.bar){x+=`<p>yes</p>`;}else{x+=`<p>no ${xyz.way}</p>`;}return x'
	);
});

control.run();

// ---

const vars = suite('vars');

vars('{{#var foo = "world" }}', () => {
	assert.is(
		transform('{{#var foo = "world"}}<p>hello {{ foo }}</p>'),
		'var x="";var foo="world";x+=`<p>hello ${foo}</p>`;return x'
	);

	assert.is(
		transform('{{#var foo = "world";}}<p>hello {{ foo }}</p>'),
		'var x="";var foo="world";x+=`<p>hello ${foo}</p>`;return x'
	);
});

vars('{{#var foo = 1+2 }}', () => {
	assert.is(
		transform('{{#var foo = 1+2}}<p>hello {{ foo }}</p>'),
		'var x="";var foo=1+2;x+=`<p>hello ${foo}</p>`;return x'
	);

	assert.is(
		transform('{{#var foo = 1+2;}}<p>hello {{ foo }}</p>'),
		'var x="";var foo=1+2;x+=`<p>hello ${foo}</p>`;return x'
	);
});

vars('{{#var foo = {...} }}', () => {
	assert.is(
		transform('{{#var name = { first: "luke" } }}<p>hello {{ name.first }}</p>'),
		'var x="";var name={ first: "luke" };x+=`<p>hello ${name.first}</p>`;return x'
	);

	assert.is(
		transform('{{#var name = { first:"luke" }; }}<p>hello {{ name.first }}</p>'),
		'var x="";var name={ first:"luke" };x+=`<p>hello ${name.first}</p>`;return x'
	);
});

vars.skip('{{#var foo = [...] }}', () => {
	assert.is(
		transform('{{#var name = ["luke"] }}<p>hello {{ name[0] }}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${name[0]}</p>`;return x'
	);

	assert.is(
		transform('{{#var name = ["luke"]; }}<p>hello {{ name[0] }}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${name[0]}</p>`;return x'
	);
});

// TODO: options.locals
// TODO: traverse each identifier
vars.skip('{{#var foo = truthy(bar) }}', () => {
	assert.is(
		transform('{{#var foo = truthy(bar)}}{{#if foo != 0}}<p>yes</p>{{/if}}'),
		'var x="";var foo=truthy(xyz.bar);if(foo != 0){x+=`<p>yes</p>`;}return x'
	);

	assert.is(
		transform('{{#var foo = truthy(bar); }}{{#if foo != 0}}<p>yes</p>{{ /if }}'),
		'var x="";var foo=truthy(xyz.bar);if(foo != 0){x+=`<p>yes</p>`;}return x'
	);
});

vars.run();

// ---

const comments = suite('comments');

comments('{{! hello }}', () => {
	assert.is(
		transform('{{! hello }}'),
		'var x="";return x'
	);

	assert.is(
		transform('{{!hello}}'),
		'var x="";return x'
	);
});

comments('{{! "hello world" }}', () => {
	assert.is(
		transform('{{! "hello world" }}'),
		'var x="";return x'
	);

	assert.is(
		transform('{{!"hello world"}}'),
		'var x="";return x'
	);
});

comments.run();

// ---

const each = suite('each');

each('{{#each items as item}}...{{/each}}', () => {
	assert.is(
		transform('{{#each items as item}}<p>hello {{item.name}}</p>{{/each}}'),
		'var x="";for(var i=0,item,arr=xyz.items;i<arr.length;i++){item=arr[i];x+=`<p>hello ${item.name}</p>`;}return x'
	);

	assert.is(
		transform('{{#each items as (item) }}<p>hello {{item.name}}</p>{{/each}}'),
		'var x="";for(var i=0,item,arr=xyz.items;i<arr.length;i++){item=arr[i];x+=`<p>hello ${item.name}</p>`;}return x'
	);
});

each('{{#each items as (item,idx)}}...{{/each}}', () => {
	assert.is(
		transform('<ul>{{#each items as (item,idx)}}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,arr=xyz.items;idx<arr.length;idx++){item=arr[idx];x+=`<li>hello ${item.name} (#${idx})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		transform('<ul>{{#each items as (item, idx) }}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,arr=xyz.items;idx<arr.length;idx++){item=arr[idx];x+=`<li>hello ${item.name} (#${idx})</li>`;}x+=`</ul>`;return x'
	);
});

each('{{#each items as item, idx}}...{{/each}}', () => {
	assert.is(
		transform('<ul>{{#each items as item,idx}}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,arr=xyz.items;idx<arr.length;idx++){item=arr[idx];x+=`<li>hello ${item.name} (#${idx})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		transform('<ul>{{#each items as item, idx }}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,arr=xyz.items;idx<arr.length;idx++){item=arr[idx];x+=`<li>hello ${item.name} (#${idx})</li>`;}x+=`</ul>`;return x'
	);
});

each.run();
