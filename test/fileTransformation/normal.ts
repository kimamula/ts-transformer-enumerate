import { enumerate } from '../../index';

enumerate();

type Foo = 'foo';
const Foo = enumerate<Foo>();
console.log(Foo.foo);

enumerate<'foo' | 'bar'>().bar;

type FooBar = Foo | 'bar';
type FooBarBaz = FooBar | 'foo' | 'baz';
enumerate<FooBarBaz>();

enumerate.toString();

class MyClass<T extends string> {
  enumerate() {
    return enumerate<T>();
  }
}
