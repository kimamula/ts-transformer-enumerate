import { enumerate as e } from '../../index';

e();

type Foo = 'foo';
console.log(e<Foo>().foo);

e<'foo' | 'bar'>().bar;

type FooBar = Foo | 'bar';
type FooBarBaz = FooBar | 'foo' | 'baz' | string;
e<FooBarBaz>().ping = 'pong';
