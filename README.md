# ts-transformer-enumerate

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Downloads](https://img.shields.io/npm/dm/ts-transformer-enumerate.svg)](https://www.npmjs.com/package/ts-transformer-enumerate)

A TypeScript custom transformer which enables enumerating members of the union of string literal types.

# Requirement
TypeScript >= 2.3.0

# How to use this package

This package exports 2 functions.
One is `enumerate` which is used in TypeScript codes to enumerate members of the union of string literal types, while the other is a TypeScript custom transformer which is used to compile the `enumerate` function correctly.

## How to use `enumerate`

```ts
import { enumerate } from 'ts-transformer-enumerate';

type Colors = 'green' | 'yellow' | 'red';
const Colors = enumerate<Colors>();

console.log(Colors.green); // 'green'
console.log(Colors.yellow); // 'yellow'
console.log(Colors.red); // 'red'
```

## How to use the custom transformer

Unfortunately, the only way currently available to use custom transformers is to use them with TypeScript compiler API (See https://github.com/Microsoft/TypeScript/issues/14419 for detail).
Something like the following works.

```js
const ts = require('typescript');
const enumerateTransformer = require('ts-transformer-enumerate/transformer').default;

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
var ts_transformer_enumerate_1 = require("ts-transformer-enumerate");
var Colors = { green: "green", yellow: "yellow", red: "red" };
console.log(Colors.green); // 'green'
console.log(Colors.yellow); // 'yellow'
console.log(Colors.red); // 'red'
```

# Note

* TypeScript 2.3.0-dev currently has a bug in transformation API, which prevents this package to work correctly in some cases.
  * https://github.com/Microsoft/TypeScript/issues/15192
* The `enumerate` function can only be used as a call expression. Writing something like `enumerate.toString()` results in a runtime error.

# License

MIT

[travis-image]:https://travis-ci.org/kimamula/ts-transformer-enumerate.svg?branch=master
[travis-url]:https://travis-ci.org/kimamula/ts-transformer-enumerate
[npm-image]:https://img.shields.io/npm/v/ts-transformer-enumerate.svg?style=flat
[npm-url]:https://npmjs.org/package/ts-transformer-enumerate
