import { enumerate } from '../index';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { compile } from './compile';

describe('enumerate', () => {
  it('enumerates members of the union of string literal types', () => {
    assert.deepStrictEqual(enumerate(), {});
    type Foo = 'foo';
    assert.deepStrictEqual(enumerate<Foo>(), { foo: 'foo' });
    type FooBar = 'foo' | 'bar';
    assert.deepStrictEqual(enumerate<FooBar>(), { foo: 'foo', bar: 'bar' });
    type FooBarBaz = 'foo' | 'bar' | 'baz';
    assert.deepStrictEqual(enumerate<FooBarBaz>(), { foo: 'foo', bar: 'bar', baz: 'baz' });
  });
  const fileTransformationDir = path.join(__dirname, 'fileTransformation');
  fs.readdirSync(fileTransformationDir).filter((file) => path.extname(file) === '.ts').forEach((file) =>
    it(`transforms ${file} as expected`, () => {
        let result = '';
        const fullFileName = path.join(fileTransformationDir, file), postCompileFullFileName = fullFileName.replace(/\.ts$/, '.js');
        compile([fullFileName], (fileName, data) => postCompileFullFileName === fileName && (result = data));
        assert.strictEqual(result, fs.readFileSync(postCompileFullFileName, 'utf-8'));
    }).timeout(5000)
  );
});
