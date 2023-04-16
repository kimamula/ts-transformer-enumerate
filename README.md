# ts-transformer-enumerate

![Build Status](https://github.com/kimamula/ts-transformer-enumerate/workflows/test/badge.svg)
[![NPM version][npm-image]][npm-url]
[![Downloads](https://img.shields.io/npm/dm/ts-transformer-enumerate.svg)](https://www.npmjs.com/package/ts-transformer-enumerate)

A TypeScript custom transformer which enables enumerating members of the union of string literal types.

# Requirement
TypeScript >= 2.4.1

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

Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (See https://github.com/Microsoft/TypeScript/issues/14419 for detail).
It is recommended to use the custom transformer with webpack, Rollup, or ttypescript as [described](https://github.com/kimamula/ts-transformer-keys#how-to-use-the-custom-transformer).
You can also use the transformer with TypeScript compiler API as follows.

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

* The `enumerate` function can only be used as a call expression. Writing something like `enumerate.toString()` results in a runtime error.
* `enumerate` does not work with a dynamic type parameter, i.e., `enumerate<T>()` in the following code is converted to an empty object(`{}`).

```ts
class MyClass<T extends string> {
  enumerate() {
    return enumerate<T>();
  }
}
```

# License

MIT

[travis-image]:https://travis-ci.org/kimamula/ts-transformer-enumerate.svg?branch=master
[travis-url]:https://travis-ci.org/kimamula/ts-transformer-enumerate
[npm-image]:https://img.shields.io/npm/v/ts-transformer-enumerate.svg?style=flat
[npm-url]:https://npmjs.org/package/ts-transformer-enumerate
