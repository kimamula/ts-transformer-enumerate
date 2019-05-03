import { enumerate } from '../index';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { compile } from './compile/compile';
import { NS, Colors } from './external';

describe('enumerate', () => {
  it('enumerates members of the union of string literal types', () => {
    assert.deepStrictEqual(enumerate(), {});
    type Foo = 'foo';
    assert.deepStrictEqual(enumerate<Foo>(), { 'foo': 'foo' });
    type FooBar = 'foo' | 'bar';
    assert.deepStrictEqual(enumerate<FooBar>(), { 'foo': 'foo', 'bar': 'bar' });
    type FooBarBaz = 'foo' | 'bar' | 'baz';
    assert.deepStrictEqual(enumerate<FooBarBaz>(), { 'foo': 'foo', 'bar': 'bar', 'baz': 'baz' });
  });
  it('generate valid compilable code', () => {
    type FooBarBaz = '/foo/foo' | 'bar-bar' | 'baz.baz';
    assert.deepStrictEqual(enumerate<FooBarBaz>(), { '/foo/foo': '/foo/foo', 'bar-bar': 'bar-bar', 'baz.baz': 'baz.baz' });
    type LotsOfCharacters = '1234567890!@#$%^&*()_+-={}[]|\\:;<>?,./~`"';
    assert.deepStrictEqual(enumerate<LotsOfCharacters>(), { '1234567890!@#$%^&*()_+-={}[]|\\:;<>?,./~`"': '1234567890!@#$%^&*()_+-={}[]|\\:;<>?,./~`"' });
  });
  it('enumerates members of types imported from external files', () => {
    assert.deepStrictEqual(enumerate<Colors>(), { 'red': 'red', 'green': 'green', 'blue': 'blue' });
    assert.deepStrictEqual(enumerate<NS.Colors>(), { 'red': 'red', 'green': 'green', 'blue': 'blue' });
  });
  const fileTransformationDir = path.join(__dirname, 'fileTransformation');
  fs.readdirSync(fileTransformationDir).filter((file) => path.extname(file) === '.ts').forEach((file) =>
    it(`transforms ${file} as expected`, () => {
        let result = '';
        const fullFileName = path.join(fileTransformationDir, file), postCompileFullFileName = fullFileName.replace(/\.ts$/, '.js');
        compile([fullFileName], (fileName, data) => postCompileFullFileName === path.join(fileName) && (result = data));
        assert.strictEqual(result.replace(/\r\n/g, '\n'), fs.readFileSync(postCompileFullFileName, 'utf-8'));
    }).timeout(0)
  );
});
