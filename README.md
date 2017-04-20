# ts-plugin-enumerate
TypeScript compiler plugin which enables enumerating members of the union of string literal types.

# Requirement
TypeScript >= 2.3.0

# How to use this package

This package exports 2 kinds of functions.
One is to be used in TypeScript codes to enumerate members of the union of string literal types, while the other is to be used as a plugin for TypeScript compiler to correctly compile the enumerate function.

## How to use this package in TypeScript codes

```ts
import { enumerate } from 'ts-plugin-enumerate';

type Colors = 'green' | 'yellow' | 'red';
const Colors = enumerate<Colors>();

console.log(Colors.green); // 'green'
console.log(Colors.yellow); // 'yellow'
console.log(Colors.red); // 'red'
```

## How to use this package to compile TypeScript codes

Unfortunately, the only way currently available to use the plugin is to use it with TypeScript compiler API (See https://github.com/Microsoft/TypeScript/issues/14419 for detail).
Something like the following works.

```js
const ts = require('typescript');
const enumerateTransformer = require('ts-plugin-enumerate/lib/transformer').default;

const program = ts.createProgram([/* your files to compile */], {
  strict: true,
  noEmitOnError: true,
  target: ts.ScriptTarget.ES5
});

const transformers = {
  before: [enumerateTransformer(program)],
  after: []
};
const { emitSkipped, diagnostics } = program.emit(undefined, undefined, undefined, false, transformers);

if (emitSkipped) {
  throw new Error(diagnostics.map(diagnostic => diagnostic.messageText).join('\n'));
}
```

As a result, the TypeScript code shown above is compiled into the following JavaScript.

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_plugin_enumerate_1 = require("ts-plugin-enumerate");
var Colors = { green: "green", yellow: "yellow", red: "red" };
console.log(Colors.green); // 'green'
console.log(Colors.yellow); // 'yellow'
console.log(Colors.red); // 'red'
```

# Note

* TypeScript 2.3.0-dev currently has a bug in transformation API, which prevents this plugin to work correctly.
  * https://github.com/Microsoft/TypeScript/issues/15192
* The `enumerate` function can only be used as a call expression. Writing something like `enumerate.toString()` results in a runtime error.

# License

MIT
