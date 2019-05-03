"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
({});
var Foo = { "foo": "foo" };
console.log(Foo.foo);
({ "foo": "foo", "bar": "bar" }.bar);
({ "foo": "foo", "bar": "bar", "baz": "baz" });
index_1.enumerate.toString();
var MyClass = /** @class */ (function () {
    function MyClass() {
    }
    MyClass.prototype.enumerate = function () {
        return {};
    };
    return MyClass;
}());
