import * as tslib_1 from "tslib";
import { Mixable, define, predefine, mixins, mixinRules, definitions } from 'type-r';
import { expect } from 'chai';
var M = {
    num: 1,
    nul: null,
    undef: void 0,
    obj: { hi: 'there' },
    fun: function () { },
    arr: [],
    fwd: function (arr) { arr.push("M"); },
    bck: function (arr) { arr.push("M"); }
};
var C = (function () {
    function C() {
    }
    C.prototype.b = function () { };
    C.prototype.fwd = function (arr) { arr.push("C"); };
    C.prototype.bck = function (arr) { arr.push("C"); };
    C.a = 1;
    return C;
}());
describe("Forward declarations", function () {
    it('@predefine calls onExtend hook', function () {
        var called = 0;
        var X = (function () {
            function X() {
            }
            X.onExtend = function (BaseClass) {
                expect(BaseClass).to.eql(Object);
                called++;
            };
            X = tslib_1.__decorate([
                predefine
            ], X);
            return X;
        }());
        expect(called).to.eql(1);
    });
});
describe("@define decorator", function () {
    it('@define makes plain class mixable', function () {
        var X = (function () {
            function X() {
            }
            X = tslib_1.__decorate([
                define
            ], X);
            return X;
        }());
        expect(X.define).to.exist;
    });
    it('@define calls onDefine hook', function () {
        var called = 0;
        var X = (function () {
            function X() {
            }
            X.onDefine = function (spec, BaseClass) {
                called++;
                expect(spec).to.eql({});
                expect(BaseClass).to.eql(Object);
            };
            X = tslib_1.__decorate([
                define({ a: 1 })
            ], X);
            return X;
        }());
        expect(X.define).to.exist;
        expect(called).to.eql(1);
    });
    it('@define does nothing when extend mixable', function () {
        var X = (function (_super) {
            tslib_1.__extends(X, _super);
            function X() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            X = tslib_1.__decorate([
                define
            ], X);
            return X;
        }(Mixable));
        expect(X.__super__).to.eql(Mixable.prototype);
    });
    it('@define( props ) assign members to class proto', function () {
        var X = (function () {
            function X() {
            }
            X.prototype.a = function () { };
            X = tslib_1.__decorate([
                define({
                    a: 1,
                    b: 2
                })
            ], X);
            return X;
        }());
        expect(X.prototype.b).to.eql(2);
        expect(X.prototype.a).to.eql(1);
    });
    it('Mixable.extend creates the subclass', function () {
        var X = Mixable.extend({ a: 5 });
        var x = new X();
        expect(x.a).to.eql(5);
        expect(x).to.be.instanceof(Mixable);
    });
    it('allows toString() and valueOf() override', function () {
        var Base = (function (_super) {
            tslib_1.__extends(Base, _super);
            function Base() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Base.prototype.toString = function () { return "base"; };
            Base.prototype.valueOf = function () { return 'base'; };
            Base = tslib_1.__decorate([
                define
            ], Base);
            return Base;
        }(Mixable));
        var Sub = (function (_super) {
            tslib_1.__extends(Sub, _super);
            function Sub() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Sub.prototype.toString = function () { return "sub"; };
            Sub.prototype.valueOf = function () { return 'sub'; };
            Sub = tslib_1.__decorate([
                define
            ], Sub);
            return Sub;
        }(Base));
        var base = new Base(), sub = new Sub();
        expect(base.toString()).to.eql('base');
        expect(base.valueOf()).to.eql('base');
        expect(sub.toString()).to.eql('sub');
        expect(sub.valueOf()).to.eql('sub');
    });
    it('allows toString() and valueOf() override with .extend()', function () {
        var Base = Mixable.extend({
            toString: function () { return "base"; },
            valueOf: function () { return 'base'; }
        });
        var Sub = Base.extend({
            toString: function () { return "sub"; },
            valueOf: function () { return 'sub'; }
        });
        var base = new Base(), sub = new Sub();
        expect(base.toString()).to.eql('base');
        expect(base.valueOf()).to.eql('base');
        expect(sub.toString()).to.eql('sub');
        expect(sub.valueOf()).to.eql('sub');
    });
    it("gives priority to the class definition", function () {
        var X = (function (_super) {
            tslib_1.__extends(X, _super);
            function X() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            X.prototype.nul = function () { };
            X = tslib_1.__decorate([
                define({
                    undef: 1
                }),
                mixins(M)
            ], X);
            return X;
        }(Mixable));
        expect(X.prototype.nul).to.be.instanceof(Function);
        expect(X.prototype.undef).to.be.eql(1);
    });
});
describe('@mixins', function () {
    it("merges in the plain objects", function () {
        var X = (function (_super) {
            tslib_1.__extends(X, _super);
            function X() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            X = tslib_1.__decorate([
                define,
                mixins(M)
            ], X);
            return X;
        }(Mixable));
        expect(X.prototype).to.contain(M);
    });
    it("don't merge same mixin twice", function () {
        var X = (function (_super) {
            tslib_1.__extends(X, _super);
            function X() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            X = tslib_1.__decorate([
                define,
                mixins(M, M)
            ], X);
            return X;
        }(Mixable));
        expect(X.mixins.appliedMixins.length).to.equal(1);
        var Y = (function (_super) {
            tslib_1.__extends(Y, _super);
            function Y() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Y = tslib_1.__decorate([
                define, mixins(M)
            ], Y);
            return Y;
        }(X));
        expect(Y.mixins.appliedMixins.length).to.equal(1);
    });
    it("mix in classes", function () {
        var X = (function () {
            function X() {
            }
            X = tslib_1.__decorate([
                define, mixins(C)
            ], X);
            return X;
        }());
        var x = new X();
        expect(X.a).to.eql(1);
        expect(x.b).to.be.instanceof(Function);
    });
    it("mix in sequence", function () {
        var A = { a: 1, b: 1 }, B = { a: 2 };
        var X = (function () {
            function X() {
            }
            X = tslib_1.__decorate([
                define, mixins(B, A)
            ], X);
            return X;
        }());
        var x = new X();
        expect(x.a).to.eql(2);
        expect(x.b).to.eql(1);
    });
    it('merge methods from mixin if they are not locally defined', function () {
        var Base = (function () {
            function Base() {
            }
            Base.prototype.first = function () { };
            Base = tslib_1.__decorate([
                define
            ], Base);
            return Base;
        }());
        var Mix = {
            first: function () { },
            second: function () { }
        };
        var Y = (function (_super) {
            tslib_1.__extends(Y, _super);
            function Y() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Y.prototype.second = function () { };
            Y = tslib_1.__decorate([
                define, mixins(Mix)
            ], Y);
            return Y;
        }(Base));
        expect(Y.prototype.second).to.not.eql(Mix.second);
        expect(Y.prototype.first).to.eql(Mix.first);
    });
});
describe('mixin rules', function () {
    var X = (function () {
        function X() {
        }
        X = tslib_1.__decorate([
            define,
            mixins(M, C),
            mixinRules({
                fwd: mixinRules.classFirst,
                bck: mixinRules.classLast
            })
        ], X);
        return X;
    }());
    it('chains functions when merge rules are defined', function () {
        var x = new X();
        var fwda = [], bcka = [];
        x.fwd(fwda);
        expect(fwda).to.have.ordered.members(["M", "C"]);
        x.bck(bcka);
        expect(bcka).to.have.ordered.members(["C", "M"]);
    });
    it('chains function on inheritance', function () {
        var Y = (function (_super) {
            tslib_1.__extends(Y, _super);
            function Y() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Y.prototype.fwd = function (arr) { arr.push('Y'); };
            Y.prototype.bck = function (arr) { arr.push('Y'); };
            Y = tslib_1.__decorate([
                define,
                mixins({
                    fwd: function (arr) { arr.push('Z'); },
                    bck: function (arr) { arr.push('Z'); }
                })
            ], Y);
            return Y;
        }(X));
        var y = new Y();
        var fwda = [], bcka = [];
        y.fwd(fwda);
        expect(fwda).to.have.ordered.members(["Y", "Z", "M", "C"]);
        y.bck(bcka);
        expect(bcka).to.have.ordered.members(["C", "M", "Z", "Y"]);
    });
});
describe('@definitions', function () {
    it('extract definitions from statics', function () {
        var Y = (function () {
            function Y() {
            }
            Y.onDefine = function (spec) {
                expect(spec).to.deep.equal({ a: 'a', b: { a: 1 } });
                this.prototype.zzz = 'Hurrah!';
            };
            Y.a = 'a';
            Y.b = { a: 1 };
            Y = tslib_1.__decorate([
                define,
                definitions({
                    a: mixinRules.value,
                    b: mixinRules.merge
                })
            ], Y);
            return Y;
        }());
    });
    it('extract definitions from @define parameter', function () {
        var Y = (function () {
            function Y() {
            }
            Y.onDefine = function (spec) {
                expect(spec).to.deep.equal({ a: 'a', b: { a: 1 } });
                this.prototype.zzz = 'Hurrah!';
            };
            Y = tslib_1.__decorate([
                define({
                    a: 'a',
                    b: { a: 1 }
                }),
                definitions({
                    a: mixinRules.value,
                    b: mixinRules.merge
                })
            ], Y);
            return Y;
        }());
    });
    it('extract definitions from mixins', function () {
        var Y = (function () {
            function Y() {
            }
            Y.onDefine = function (spec) {
                expect(spec).to.deep.equal({ a: 'a', b: { a: 1, b: 1, c: 1 } });
                this.prototype.zzz = 'Hurrah!';
            };
            Y.b = { c: 1 };
            Y = tslib_1.__decorate([
                define({
                    a: 'a',
                    b: { a: 1 }
                }),
                mixins({
                    a: 'no',
                    b: { b: 1, a: 2 }
                }),
                definitions({
                    a: mixinRules.value,
                    b: mixinRules.merge
                })
            ], Y);
            return Y;
        }());
    });
});
//# sourceMappingURL=mixins.test.js.map