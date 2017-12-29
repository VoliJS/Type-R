import * as tslib_1 from "tslib";
import "reflect-metadata";
import { define, attr, Record, Store } from '../../../lib';
import { expect } from 'chai';
import { memoryIO } from '../../../lib/endpoints/memory';
import { attributesIO } from '../../../lib/endpoints/attributes';
import { localStorageIO } from '../../../lib/endpoints/localStorage';
describe('IO', function () {
    describe('memory endpoint', function () {
        var testData = [
            { name: "John" }
        ];
        var User = (function (_super) {
            tslib_1.__extends(User, _super);
            function User() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            User.endpoint = memoryIO(testData);
            tslib_1.__decorate([
                attr,
                tslib_1.__metadata("design:type", String)
            ], User.prototype, "name", void 0);
            User = tslib_1.__decorate([
                define
            ], User);
            return User;
        }(Record));
        it('loads the test data', function (done) {
            var users = new User.Collection();
            users.fetch()
                .then(function () {
                expect(users.length).to.eql(1);
                expect(users.first().name).to.eql('John');
                done();
            });
        });
        it('create', function (done) {
            var x = new User({ name: "test" });
            x.save().then(function () {
                expect(x.id).to.eql("1");
                done();
            });
        });
        it('read', function (done) {
            var x = new User({ id: "1" });
            x.fetch().then(function () {
                expect(x.name).to.eql("test");
                done();
            });
        });
        it('update', function (done) {
            var x = new User({ id: "1" });
            x.fetch()
                .then(function () {
                x.name = "Mike";
                return x.save();
            })
                .then(function () {
                var y = new User({ id: "1" });
                return y.fetch();
            })
                .then(function (y) {
                expect(y.name).to.eql('Mike');
                done();
            });
        });
        it('list', function (done) {
            var users = new User.Collection();
            users.fetch()
                .then(function () {
                expect(users.length).to.eql(2);
                expect(users.first().name).to.eql("John");
                expect(users.last().name).to.eql("Mike");
                done();
            });
        });
        it("destroy", function (done) {
            var x = new User({ id: "1" });
            x.destroy()
                .then(function () {
                var users = new User.Collection();
                return users.fetch();
            })
                .then(function (users) {
                expect(users.length).to.eql(1);
                expect(users.first().name).to.eql("John");
                done();
            });
        });
    });
    it('can override endpoint with .has.endpoint', function (done) {
        var NoEndpoint = (function (_super) {
            tslib_1.__extends(NoEndpoint, _super);
            function NoEndpoint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            NoEndpoint.attributes = {
                type: 'no endpoint'
            };
            NoEndpoint = tslib_1.__decorate([
                define
            ], NoEndpoint);
            return NoEndpoint;
        }(Record));
        var HasEndpoint = (function (_super) {
            tslib_1.__extends(HasEndpoint, _super);
            function HasEndpoint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            HasEndpoint.endpoint = memoryIO([{ id: 666 }]);
            HasEndpoint.attributes = {
                type: 'has endpoint'
            };
            HasEndpoint = tslib_1.__decorate([
                define
            ], HasEndpoint);
            return HasEndpoint;
        }(Record));
        var TestStore = (function (_super) {
            tslib_1.__extends(TestStore, _super);
            function TestStore() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            TestStore.endpoint = attributesIO();
            TestStore.attributes = {
                a: NoEndpoint.Collection.has.endpoint(memoryIO([{ id: "777" }])),
                b: HasEndpoint.Collection,
                c: HasEndpoint.Collection.has.endpoint(memoryIO([{ id: "555" }]))
            };
            TestStore = tslib_1.__decorate([
                define
            ], TestStore);
            return TestStore;
        }(Store));
        var s = new TestStore();
        s.fetch().then(function () {
            expect(s.a.first().id).to.eql("777");
            expect(s.b.first().id).to.eql(666);
            expect(s.c.first().id).to.eql("555");
            done();
        });
    });
    if (typeof localStorage !== 'undefined')
        describe('localStorage endpoint', testEndpoint(localStorageIO("/test")));
});
function testEndpoint(endpoint) {
    return function () {
        var User = (function (_super) {
            tslib_1.__extends(User, _super);
            function User() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            User.endpoint = endpoint;
            tslib_1.__decorate([
                attr,
                tslib_1.__metadata("design:type", String)
            ], User.prototype, "name", void 0);
            User = tslib_1.__decorate([
                define
            ], User);
            return User;
        }(Record));
        var generatedId;
        it('create', function (done) {
            var x = new User({ name: "test" });
            x.save().then(function () {
                generatedId = x.id;
                expect(x.id).to.be.not.empty;
                done();
            });
        });
        it('read', function (done) {
            var x = new User({ id: generatedId });
            x.fetch().then(function () {
                expect(x.name).to.eql("test");
                done();
            });
        });
        it('update', function (done) {
            var x = new User({ id: generatedId });
            x.fetch()
                .then(function () {
                x.name = "Mike";
                return x.save();
            })
                .then(function () {
                var y = new User({ id: generatedId });
                return y.fetch();
            })
                .then(function (y) {
                expect(y.name).to.eql('Mike');
                done();
            });
        });
        it('list', function (done) {
            var users = new User.Collection();
            users.fetch()
                .then(function () {
                expect(users.length).to.eql(1);
                expect(users.last().name).to.eql("Mike");
                done();
            });
        });
        it("destroy", function (done) {
            var x = new User({ id: generatedId });
            x.destroy()
                .then(function () {
                var users = new User.Collection();
                return users.fetch();
            })
                .then(function (users) {
                expect(users.length).to.eql(0);
                done();
            });
        });
    };
}
//# sourceMappingURL=io.js.map