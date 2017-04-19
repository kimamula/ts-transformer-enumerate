import { enumerate } from '../../index';

enumerate();

type Foo = 'foo';
console.log(enumerate<Foo>().foo);

enumerate<'foo' | 'bar'>().bar;

type FooBar = Foo | 'bar';
type FooBarBaz = FooBar | 'foo' | 'baz' | string;
const enumeratedFooBarBaz = enumerate<FooBarBaz>();
enumeratedFooBarBaz.ping = 'pong';
