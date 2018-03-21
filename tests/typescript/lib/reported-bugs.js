import * as tslib_1 from "tslib";
import "reflect-metadata";
import { define, attr, mixins, Record, type, Collection } from 'type-r';
import { expect } from 'chai';
import { MinutesInterval } from './common';
describe('Bugs from Volicon Observer', function () {
    describe('Attribute change watcher', function () {
        it('works in base class and subclass', function () {
            var calls = [];
            var Base = (function (_super) {
                tslib_1.__extends(Base, _super);
                function Base() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    type(String).watcher(function (x) { return calls.push('inherited'); }).as,
                    tslib_1.__metadata("design:type", String)
                ], Base.prototype, "inherited", void 0);
                tslib_1.__decorate([
                    type(String).watcher('onNamedWatcher').as,
                    tslib_1.__metadata("design:type", String)
                ], Base.prototype, "namedWatcher", void 0);
                tslib_1.__decorate([
                    type(String).watcher(function (x) { return calls.push('base'); }).as,
                    tslib_1.__metadata("design:type", String)
                ], Base.prototype, "overriden", void 0);
                Base = tslib_1.__decorate([
                    define
                ], Base);
                return Base;
            }(Record));
            var Subclass = (function (_super) {
                tslib_1.__extends(Subclass, _super);
                function Subclass() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Subclass.prototype.onNamedWatcher = function () {
                    calls.push('named');
                };
                tslib_1.__decorate([
                    attr(String.has.watcher(function (x) { return calls.push('added'); })),
                    tslib_1.__metadata("design:type", String)
                ], Subclass.prototype, "added", void 0);
                tslib_1.__decorate([
                    attr(String.has.watcher(function (x) { return calls.push('subclass'); })),
                    tslib_1.__metadata("design:type", String)
                ], Subclass.prototype, "overriden", void 0);
                Subclass = tslib_1.__decorate([
                    define
                ], Subclass);
                return Subclass;
            }(Base));
            var subclass = new Subclass();
            subclass.inherited = "a";
            subclass.added = "b";
            subclass.overriden = "b";
            subclass.namedWatcher = "t";
            expect(calls).to.eql(['inherited', 'added', 'subclass', 'base', 'named']);
        });
    });
    describe('Validation', function () {
        it('performs validation if collection item is changed', function () {
            var BitrateModel = Record.extend({
                defaults: {
                    bitrate: Number.value(512)
                },
                properties: {
                    bitrates: function () {
                        var available_bitrate = [128, 256, 384, 450, 512, 768, 896, 1000, 1500, 2000, 2500, 3000, 4500, 6000, 6500, 9000, 12000, 15000];
                        if (available_bitrate.indexOf(this.bitrate) === -1) {
                            available_bitrate.push(this.bitrate);
                        }
                        return available_bitrate.sort(function (a, b) {
                            return a - b;
                        });
                    }
                },
                initialize: function (options) {
                    Record.prototype.initialize.apply(this, arguments);
                },
                parse: function (data) {
                    return { bitrate: data / 1000 };
                },
                toJSON: function () {
                    var json = Record.prototype.toJSON.apply(this, arguments), bitrate = json.bitrate * 1000;
                    return bitrate;
                }
            });
            var SubEncoder = Record.extend({
                defaults: {
                    Bitrate: BitrateModel,
                    HistoryDepth: type(MinutesInterval).value(43800),
                    BitrateAsString: null,
                    ResolutionHeight: Number,
                    ResolutionWidth: Number,
                    resolution: String.has.toJSON(false)
                },
                collection: {
                    get: function (a) {
                        return Collection.prototype.get.apply(this, arguments) || this.models[a];
                    },
                    comparator: function (model1, model2) {
                        if (model1.Bitrate.bitrate > model2.Bitrate.bitrate) {
                            return 1;
                        }
                        else if (model1.Bitrate.bitrate < model2.Bitrate.bitrate) {
                            return -1;
                        }
                        else {
                            if (model1.ResolutionWidth > model2.ResolutionWidth) {
                                return 1;
                            }
                            else if (model1.ResolutionWidth < model2.ResolutionWidth) {
                                return -1;
                            }
                            else {
                                if (model1.ResolutionHeight > model2.ResolutionHeight) {
                                    return 1;
                                }
                                else if (model1.ResolutionHeight < model2.ResolutionHeight) {
                                    return -1;
                                }
                                else {
                                    return 0;
                                }
                            }
                        }
                    },
                    localEvents: {
                        change: function () {
                            this.sort();
                        }
                    }
                }
            });
            var Placeholder = Record.extend({
                attributes: {
                    subEncoders: SubEncoder.Collection.has.check(function (x) {
                        return x.length > 0;
                    }, 'ccccc')
                }
            });
            var p = new Placeholder(), subEncoders = p.subEncoders;
            expect(p.isValid()).to.be.false;
            expect(subEncoders.isValid()).to.be.true;
            subEncoders.add({});
            expect(p._validationError).to.be.undefined;
            expect(p.isValid()).to.be.true;
            subEncoders.first().HistoryDepth.value = 2;
            expect(p._validationError).to.be.undefined;
            expect(p.isValid()).to.be.true;
            expect(subEncoders.isValid()).to.be.true;
            expect(p._validationError).not.to.be.undefined;
        });
    });
    describe('assignFrom', function () {
        it('copy the value if the target is null', function () {
            var Inner = (function (_super) {
                tslib_1.__extends(Inner, _super);
                function Inner() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], Inner.prototype, "name", void 0);
                Inner = tslib_1.__decorate([
                    define
                ], Inner);
                return Inner;
            }(Record));
            var Test = (function (_super) {
                tslib_1.__extends(Test, _super);
                function Test() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    attr(Inner.value(null)),
                    tslib_1.__metadata("design:type", Inner)
                ], Test.prototype, "inner", void 0);
                Test = tslib_1.__decorate([
                    define
                ], Test);
                return Test;
            }(Record));
            var target = new Test(), source = new Test({ inner: { name: "ron" } });
            expect(target.inner).to.be.null;
            target.assignFrom(source);
            expect(target.inner !== source.inner).to.be.true;
        });
        it('assign object of similar shape', function () {
            var A = (function (_super) {
                tslib_1.__extends(A, _super);
                function A() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], A.prototype, "a", void 0);
                A = tslib_1.__decorate([
                    define
                ], A);
                return A;
            }(Record));
            var B = (function (_super) {
                tslib_1.__extends(B, _super);
                function B() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], B.prototype, "b", void 0);
                B = tslib_1.__decorate([
                    define
                ], B);
                return B;
            }(A));
            var b = new B({ b: "b" }), a = new A({ a: "a" });
            b.assignFrom(a);
        });
    });
    describe('Mixins', function () {
        it('can work with overriden atribute', function () {
            var Source = (function (_super) {
                tslib_1.__extends(Source, _super);
                function Source() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.defineProperty(Source.prototype, "hi", {
                    get: function () {
                        return 'hi';
                    },
                    enumerable: true,
                    configurable: true
                });
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], Source.prototype, "name", void 0);
                Source = tslib_1.__decorate([
                    define
                ], Source);
                return Source;
            }(Record));
            var Target = (function (_super) {
                tslib_1.__extends(Target, _super);
                function Target() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", Number)
                ], Target.prototype, "name", void 0);
                Target = tslib_1.__decorate([
                    define,
                    mixins(Source)
                ], Target);
                return Target;
            }(Record));
            var t = new Target();
            t.name = "1";
            expect(t.name).to.eql(1);
            expect(t.hi).to.eql('hi');
        });
    });
});
//# sourceMappingURL=reported-bugs.js.map