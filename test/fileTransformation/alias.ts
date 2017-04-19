import { enumerate as e } from '../../index';

e();

type Foo = 'foo';
console.log(e<Foo>().foo);

e<'foo' | 'bar'>().bar;

type FooBar = Foo | 'bar';
type FooBarBaz = FooBar | 'foo' | 'baz' | string;
const enumeratedFooBarBaz = e<FooBarBaz>();
enumeratedFooBarBaz.ping = 'pong';

function enumerate() {
  return '';
}
const a = enumerate();
