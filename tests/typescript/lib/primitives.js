import * as tslib_1 from "tslib";
import "reflect-metadata";
import { predefine, define, attr, Record, Collection } from 'type-r';
import { expect } from 'chai';
describe('Record', function () {
    it("can be instantiated", function () {
        new Record();
    });
    describe('Subclass', function () {
        it("attaches properties to prototype", function () {
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                M = tslib_1.__decorate([
                    define({
                        a: 'a'
                    })
                ], M);
                return M;
            }(Record));
            expect(M.prototype.a).to.eql('a');
        });
    });
    describe("Attribute spec", function () {
        describe('...as constructors', function () {
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    attr(String),
                    tslib_1.__metadata("design:type", Object)
                ], M.prototype, "s", void 0);
                tslib_1.__decorate([
                    attr(Number),
                    tslib_1.__metadata("design:type", Object)
                ], M.prototype, "n", void 0);
                tslib_1.__decorate([
                    attr(Boolean),
                    tslib_1.__metadata("design:type", Object)
                ], M.prototype, "b", void 0);
                tslib_1.__decorate([
                    attr(Object),
                    tslib_1.__metadata("design:type", Object)
                ], M.prototype, "o", void 0);
                tslib_1.__decorate([
                    attr(Array),
                    tslib_1.__metadata("design:type", Object)
                ], M.prototype, "a", void 0);
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Date)
                ], M.prototype, "d", void 0);
                M = tslib_1.__decorate([
                    define
                ], M);
                return M;
            }(Record));
            it("invokes constructor to create defaults", function () {
                var m = new M();
                expect(m.s).to.equal('');
                expect(m.n).to.equal(0);
                expect(m.b).to.equal(false);
                expect(m.o).to.eql({});
                expect(m.a).to.eql([]);
                expect(m.d).to.be.instanceof(Date);
            });
            it("convert values to defined type in 'new'", function () {
                var m = new M({
                    s: 55,
                    n: "1",
                    b: 'not bool',
                    o: "not an object",
                    a: "not an array",
                    d: 678678678
                });
                expect(m.s).to.equal('55');
                expect(m.n).to.equal(1);
                expect(m.b).to.equal(true);
                expect(m.o).to.be.an.instanceOf(Object);
                expect(m.a).to.eql([]);
                expect(m.d).to.be.instanceof(Date);
            });
            it("convert values to defined types on assignment", function () {
                var m = new M();
                m.s = 55;
                m.n = "1";
                m.b = 'not bool';
                m.o = "not an object";
                m.a = "not an array";
                m.d = 678678678;
                expect(m.s).to.equal('55');
                expect(m.n).to.equal(1);
                expect(m.b).to.equal(true);
                expect(m.o).to.be.an.instanceOf(Object);
                expect(m.a).to.eql([]);
                expect(m.d).to.be.instanceof(Date);
            });
            it("convert values to defined types on set", function () {
                var m = new M();
                m.set({
                    s: 55,
                    n: "1",
                    b: 'not bool',
                    o: "not an object",
                    a: "not an array",
                    d: 678678678
                });
                expect(m.s).to.equal('55');
                expect(m.n).to.equal(1);
                expect(m.b).to.equal(true);
                expect(m.o).to.be.an.instanceOf(Object);
                expect(m.a).to.eql([]);
                expect(m.d).to.be.instanceof(Date);
            });
        });
        describe('...as default values', function () {
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.s = 'b';
                    _this.n = 1;
                    _this.b = true;
                    _this.o = {};
                    _this.a = [];
                    return _this;
                }
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], M.prototype, "s", void 0);
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Number)
                ], M.prototype, "n", void 0);
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Boolean)
                ], M.prototype, "b", void 0);
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Object)
                ], M.prototype, "o", void 0);
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Array)
                ], M.prototype, "a", void 0);
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Date)
                ], M.prototype, "d", void 0);
                M = tslib_1.__decorate([
                    define
                ], M);
                return M;
            }(Record));
            it("accepts values as type spec", function () {
                var m = new M();
                expect(m.s).to.equal('b');
                expect(m.n).to.equal(1);
                expect(m.b).to.equal(true);
                expect(m.o).to.not.equal({});
                expect(m.o).to.be.an.instanceOf(Object);
                expect(m.a).to.not.equal([]);
                expect(m.a).to.eql([]);
                expect(m.d).to.be.instanceof(Date);
            });
            it("infers types from values", function () {
                var m = new M(), _attributes = m._attributes;
                expect(_attributes.s.type).to.equal(String);
                expect(_attributes.n.type).to.equal(Number);
                expect(_attributes.b.type).to.equal(Boolean);
                expect(_attributes.o.type).to.equal(Object);
                expect(_attributes.a.type).to.equal(Array);
                expect(_attributes.d.type).to.equal(Date);
            });
        });
        describe('...as constructors with values', function () {
            it("converts default values to defined types", function () {
                var M = (function (_super) {
                    tslib_1.__extends(M, _super);
                    function M() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    M = tslib_1.__decorate([
                        define({
                            attributes: {
                                s: String.value(55),
                                n: Number.value("1"),
                                b: Boolean.value("some"),
                                o: Object.value("not an object"),
                                a: Array.value("not an array"),
                                d: Date.value(22222)
                            }
                        })
                    ], M);
                    return M;
                }(Record));
                var m = new M();
                expect(m.s).to.equal('55');
                expect(m.n).to.equal(1);
                expect(m.b).to.equal(true);
                expect(m.o).to.be.an.instanceOf(Object);
                expect(m.a).to.eql([]);
                expect(m.d).to.be.instanceof(Date);
            });
            it("accepts null as default value", function () {
                var M = (function (_super) {
                    tslib_1.__extends(M, _super);
                    function M() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    M = tslib_1.__decorate([
                        define({
                            attributes: {
                                s: String.value(null),
                                n: Number.value(null),
                                b: Boolean.value(null),
                                o: Object.value(null),
                                a: Array.value(null),
                                d: Date.value(null)
                            }
                        })
                    ], M);
                    return M;
                }(Record));
                var m = new M();
                expect(m.s).to.equal(null);
                expect(m.n).to.equal(null);
                expect(m.b).to.equal(null);
                expect(m.o).to.eql(null);
                expect(m.a).to.eql(null);
                expect(m.d).to.eql(null);
            });
        });
    });
    describe("Record's collection", function () {
        it("is defined in the base Record", function () {
            expect(Record.Collection).to.be.a('function');
            expect(Record.Collection.prototype.model).to.eql(Record);
        });
        it("is created on Record's extension", function () {
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                M = tslib_1.__decorate([
                    define
                ], M);
                return M;
            }(Record));
            var prototype = M.Collection.prototype;
            expect(prototype).to.be.instanceof(Record.Collection);
            expect(prototype.model).to.eql(M);
        });
        it("takes properties from .collection", function () {
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                M = tslib_1.__decorate([
                    define({
                        collection: {
                            a: 'a'
                        }
                    })
                ], M);
                return M;
            }(Record));
            expect(M.Collection.prototype.a).to.eql('a');
        });
        it("can be defined separately", function () {
            var C = (function (_super) {
                tslib_1.__extends(C, _super);
                function C() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                C = tslib_1.__decorate([
                    define({
                        a: 'a'
                    })
                ], C);
                return C;
            }(Collection));
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                M.Collection = C;
                M = tslib_1.__decorate([
                    define
                ], M);
                return M;
            }(Record));
            expect(M.Collection).to.equal(C);
            var prototype = M.Collection.prototype;
            expect(prototype).to.be.instanceof(Record.Collection);
            expect(prototype.a).to.eql('a');
            expect(prototype.model).to.eql(M);
        });
    });
    describe('Attribute types', function () {
        var Test = (function (_super) {
            tslib_1.__extends(Test, _super);
            function Test() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            tslib_1.__decorate([
                attr(Function.value(null)),
                tslib_1.__metadata("design:type", Function)
            ], Test.prototype, "fun", void 0);
            Test = tslib_1.__decorate([
                define
            ], Test);
            return Test;
        }(Record));
        it('Supports function type', function () {
            var t = new Test();
            var t2 = t.clone();
            expect(t.fun).to.eql(t2.fun);
        });
    });
    describe('Record pre-definition', function () {
        var M1 = (function (_super) {
            tslib_1.__extends(M1, _super);
            function M1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            M1 = tslib_1.__decorate([
                define
            ], M1);
            return M1;
        }(Record));
        var M2 = (function (_super) {
            tslib_1.__extends(M2, _super);
            function M2() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            M2 = tslib_1.__decorate([
                predefine
            ], M2);
            return M2;
        }(Record));
        M2.define();
        it('predefine collection types', function () {
            expect(M1.Collection).to.be.instanceOf(Function);
            expect(M2.Collection).to.be.instanceOf(Function);
        });
        it("can't be instantiated", function () {
            new M1();
        });
        it('support forward declaration', function () {
            var M = (function (_super) {
                tslib_1.__extends(M, _super);
                function M() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                M = tslib_1.__decorate([
                    define
                ], M);
                return M;
            }(Record));
            expect(M.Collection).to.be.a('function');
            expect(M.Collection.prototype.model).to.eql(M);
            M.define({
                a: 'a'
            });
            expect(M.prototype.a).to.eql('a');
        });
        it('can be defined', function () {
            M1.define({
                a: 'first',
                collection: {
                    b: 'second'
                }
            });
            M2.define({
                a: 'first'
            });
            M2.Collection.define({
                b: 'second'
            });
        });
    });
});
//# sourceMappingURL=primitives.js.map